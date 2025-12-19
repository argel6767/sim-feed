import { handler } from "../src/handlers/getPersonaPosts";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getPersonaPosts Handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          body: "This is a test post",
          author: 1,
          title: "Test Post",
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: 5,
          comments_count: 3,
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /personas/{persona_id}/posts/{page}",
    rawPath: "/personas/1/posts/1",
    rawQueryString: "",
    headers: {},
    pathParameters: { persona_id: "1", page: "1" },
    requestContext: {
      http: {
        method: "GET",
        path: "/personas/1/posts/1",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /personas/{persona_id}/posts/{page}",
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

  it("should return posts for a persona", async () => {
    const event = createEvent();
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toStrictEqual([
      {
        id: 1,
        body: "This is a test post",
        author: 1,
        title: "Test Post",
        author_username: "testuser",
        created_at: "2023-01-01T00:00:00Z",
        likes_count: 5,
        comments_count: 3,
      },
    ]);
  });

  it("should return empty array if persona has no posts", async () => {
    const event = createEvent();
    mockQuery.mockResolvedValue({ rows: [] });
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toStrictEqual([]);
  });

  it("should return 400 if persona_id is invalid", async () => {
    const event = createEvent();
    event.pathParameters!.persona_id = "invalid";
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid persona_id parameter",
    });
  });

  it("should return 400 if persona_id is missing", async () => {
    const event = createEvent();
    delete event.pathParameters!.persona_id;
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid persona_id parameter",
    });
  });

  it("should return 400 if persona_id is negative", async () => {
    const event = createEvent();
    event.pathParameters!.persona_id = "-1";
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid persona_id parameter",
    });
  });

  it("should return 400 if page is invalid", async () => {
    const event = createEvent();
    event.pathParameters!.page = "invalid";
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    });
  });

  it("should return 400 if page is missing", async () => {
    const event = createEvent();
    delete event.pathParameters!.page;
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    });
  });

  it("should return 400 if page is negative", async () => {
    const event = createEvent();
    event.pathParameters!.page = "-1";
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    });
  });

  it("should return 500 if database query fails", async () => {
    const event = createEvent();
    mockQuery.mockRejectedValue(new Error("Database connection failed"));
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Internal Server Error",
      message: "Database connection failed",
    });
  });

  it("should query with correct pagination parameters", async () => {
    const event = createEvent();
    event.pathParameters!.page = "3";
    await handler(event, context, callback);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.any(String),
      ["1", 20, 40], // persona_id, LIMIT, offset (page 3 = (3-1) * 20 = 40)
    );
  });
});
