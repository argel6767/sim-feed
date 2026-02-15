import { handler } from "../src/handlers/getPostComments";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getPostComments Handler", () => {
  let mockQuery: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          post_id: 1,
          body: "Test Comment",
          author_id: 1,
          user_author_id: null,
          author_type: "persona",
          author_username: "persona_user",
          created_at: "2023-01-01T00:00:00Z",
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts",
    rawPath: "/posts",
    rawQueryString: "page=1",
    headers: {},
    pathParameters: { post_id: "1" },
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

  it("returns persona-authored comments for a post", async () => {
    const event = createEvent();
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toEqual([
      {
        id: 1,
        post_id: 1,
        body: "Test Comment",
        author_id: 1,
        user_author_id: null,
        author_type: "persona",
        author_username: "persona_user",
        created_at: "2023-01-01T00:00:00Z",
      },
    ]);
    expect(result[0].author_type).toBe("persona");
    expect(result[0].author_id).toBe(1);
    expect(result[0].user_author_id).toBeNull();
  });

  it("returns user-authored comments for a post", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 2,
          post_id: 1,
          body: "User Comment",
          author_id: null,
          user_author_id: "clerk_user_123",
          author_type: "user",
          author_username: "realuser",
          created_at: "2023-01-01T01:00:00Z",
        },
      ],
    });

    const event = createEvent();
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(1);
    expect(result[0].author_type).toBe("user");
    expect(result[0].author_id).toBeNull();
    expect(result[0].user_author_id).toBe("clerk_user_123");
    expect(result[0].author_username).toBe("realuser");
  });

  it("returns a mix of persona-authored and user-authored comments", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 3,
          post_id: 1,
          body: "Persona Comment",
          author_id: 5,
          user_author_id: null,
          author_type: "persona",
          author_username: "persona_commenter",
          created_at: "2023-01-01T03:00:00Z",
        },
        {
          id: 2,
          post_id: 1,
          body: "User Comment",
          author_id: null,
          user_author_id: "clerk_user_456",
          author_type: "user",
          author_username: "user_commenter",
          created_at: "2023-01-01T02:00:00Z",
        },
        {
          id: 1,
          post_id: 1,
          body: "Another Persona Comment",
          author_id: 7,
          user_author_id: null,
          author_type: "persona",
          author_username: "another_persona",
          created_at: "2023-01-01T01:00:00Z",
        },
      ],
    });

    const event = createEvent();
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(3);
    expect(result[0].author_type).toBe("persona");
    expect(result[0].user_author_id).toBeNull();
    expect(result[1].author_type).toBe("user");
    expect(result[1].author_id).toBeNull();
    expect(result[1].user_author_id).toBe("clerk_user_456");
    expect(result[2].author_type).toBe("persona");
    expect(result[2].author_id).toBe(7);
  });

  it("returns empty array when post has no comments", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const event = createEvent();
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([]);
  });

  it("should return a 400 when postId is not a number", async () => {
    const event = createEvent();
    event.pathParameters!.post_id = "abc";
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid post_id parameter",
    });
  });

  it("should return a 400 when no post_id is given", async () => {
    const event = createEvent();
    event.pathParameters!.post_id = undefined;

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid post_id parameter",
    });
  });

  it("should return a 400 when post_id is negative", async () => {
    const event = createEvent();
    event.pathParameters!.post_id = "-1";

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid post_id parameter",
    });
  });

  it("should return 500 when database query fails", async () => {
    mockQuery.mockRejectedValue(new Error("Database connection failed"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const event = createEvent();
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Internal Server Error",
      message: "Database connection failed",
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
