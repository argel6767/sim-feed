import { handler } from "../src/handlers/getPosts";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db.ts");

describe("getPosts handler", () => {
  let mockQuery: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          title: "Test Post",
          body: "Test body",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "0",
          comments_count: "0",
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (page?: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts",
    rawPath: "/posts",
    rawQueryString: `page=${page}`,
    headers: {},
    pathParameters: { page: page },
    requestContext: {
      http: {
        method: "GET",
        path: "/posts",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /posts",
      stage: "$default",
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "example.com",
      domainPrefix: "example",
      requestId: "request-id",
      timeEpoch: Date.now(),
      time: "2023-01-01T00:00:00Z",
    },
    body: "",
    isBase64Encoded: false,
  });

  const context = {} as any;
  const callback = jest.fn();

  it("should return a list of posts with persona author", async () => {
    const event = createEvent("1");
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      {
        id: 1,
        title: "Test Post",
        body: "Test body",
        author: 1,
        user_author: null,
        author_type: "persona",
        author_username: "testuser",
        created_at: "2023-01-01T00:00:00Z",
        likes_count: "0",
        comments_count: "0",
      },
    ]);
  });

  it("should return posts with user author", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 2,
          title: "User Post",
          body: "A post by a real user",
          author: null,
          user_author: "clerk_user_123",
          author_type: "user",
          author_username: "realuser",
          created_at: "2023-01-02T00:00:00Z",
          likes_count: "3",
          comments_count: "1",
        },
      ],
    });

    const event = createEvent("1");
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toEqual([
      {
        id: 2,
        title: "User Post",
        body: "A post by a real user",
        author: null,
        user_author: "clerk_user_123",
        author_type: "user",
        author_username: "realuser",
        created_at: "2023-01-02T00:00:00Z",
        likes_count: "3",
        comments_count: "1",
      },
    ]);
    expect(result[0].author).toBeNull();
    expect(result[0].user_author).toBe("clerk_user_123");
    expect(result[0].author_type).toBe("user");
  });

  it("should return a mix of persona-authored and user-authored posts", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 1,
          title: "Persona Post",
          body: "Body 1",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "persona_user",
          created_at: "2023-01-02T00:00:00Z",
          likes_count: "5",
          comments_count: "2",
        },
        {
          id: 2,
          title: "User Post",
          body: "Body 2",
          author: null,
          user_author: "clerk_abc",
          author_type: "user",
          author_username: "real_user",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "10",
          comments_count: "4",
        },
      ],
    });

    const event = createEvent("1");
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(2);
    expect(result[0].author_type).toBe("persona");
    expect(result[0].author).toBe(1);
    expect(result[0].user_author).toBeNull();
    expect(result[1].author_type).toBe("user");
    expect(result[1].author).toBeNull();
    expect(result[1].user_author).toBe("clerk_abc");
  });

  it("should return a 400 when no number is given", async () => {
    const event = createEvent(undefined);

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    });
  });

  it("should return a 400 when page is not a number", async () => {
    const event = createEvent("abc");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    });
  });

  it("should return a 400 when page is negative", async () => {
    const event = createEvent("-1");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    });
  });
});
