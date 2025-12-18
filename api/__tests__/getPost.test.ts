import { handler } from "../src/handlers/getPost";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getPost Handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          body: "Test Post 1",
          author: 1,
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "5",
          comments: [
            {
              id: 1,
              body: "Test Comment 1",
              author_id: 2,
              author_username: "commenter1",
              created_at: "2023-01-01T01:00:00Z",
            },
            {
              id: 2,
              body: "Test Comment 2",
              author_id: 3,
              author_username: "commenter2",
              created_at: "2023-01-01T02:00:00Z",
            },
          ],
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (post_id?: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts/{post_id}",
    rawPath: `/posts/${post_id}`,
    rawQueryString: "",
    headers: {},
    pathParameters: { post_id: post_id },
    requestContext: {
      http: {
        method: "GET",
        path: `/posts/${post_id}`,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /posts/{post_id}",
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

  it("should return a single post with comments", async () => {
    const event = createEvent("1");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual({
      id: 1,
      body: "Test Post 1",
      author: 1,
      author_username: "testuser",
      created_at: "2023-01-01T00:00:00Z",
      likes_count: "5",
      comments: [
        {
          id: 1,
          body: "Test Comment 1",
          author_id: 2,
          author_username: "commenter1",
          created_at: "2023-01-01T01:00:00Z",
        },
        {
          id: 2,
          body: "Test Comment 2",
          author_id: 3,
          author_username: "commenter2",
          created_at: "2023-01-01T02:00:00Z",
        },
      ],
    });
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["1"]);
  });

  it("should return a post with empty comments array when post has no comments", async () => {
    const event = createEvent("2");
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 2,
          body: "Test Post Without Comments",
          author: 5,
          author_username: "anotheruser",
          created_at: "2023-01-02T00:00:00Z",
          likes_count: "0",
          comments: [],
        },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toEqual({
      id: 2,
      body: "Test Post Without Comments",
      author: 5,
      author_username: "anotheruser",
      created_at: "2023-01-02T00:00:00Z",
      likes_count: "0",
      comments: [],
    });
    expect(result.comments).toEqual([]);
    expect(result.comments).not.toBeNull();
  });

  it("should return 404 when post does not exist", async () => {
    const event = createEvent("999");
    mockQuery.mockResolvedValue({ rows: [] });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Post ID 999 not found",
    });
  });

  it("should return 400 when post_id parameter is missing", async () => {
    const event = createEvent();
    delete event.pathParameters!.post_id;

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid post_id parameter",
    });
  });

  it("should return 400 when post_id parameter is not a number", async () => {
    const event = createEvent("abc");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid post_id parameter",
    });
  });

  it("should return 400 when post_id parameter is an empty string", async () => {
    const event = createEvent("");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid post_id parameter",
    });
  });

  it("should return 400 when post_id parameter is a negative number", async () => {
    const event = createEvent("-1");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid post_id parameter",
    });
  });

  it("should handle valid large post IDs", async () => {
    const event = createEvent("999999");
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 999999,
          body: "Test Post with Large ID",
          author: 1,
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "10",
          comments: [],
        },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["999999"]);
  });

  it("should return post with multiple comments in correct order", async () => {
    const event = createEvent("1");
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 1,
          body: "Test Post",
          author: 1,
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "3",
          comments: [
            {
              id: 1,
              body: "First Comment",
              author_id: 2,
              author_username: "user2",
              created_at: "2023-01-01T01:00:00Z",
            },
            {
              id: 2,
              body: "Second Comment",
              author_id: 3,
              author_username: "user3",
              created_at: "2023-01-01T02:00:00Z",
            },
            {
              id: 3,
              body: "Third Comment",
              author_id: 4,
              author_username: "user4",
              created_at: "2023-01-01T03:00:00Z",
            },
          ],
        },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result.comments).toHaveLength(3);
    expect(result.comments[0].body).toBe("First Comment");
    expect(result.comments[1].body).toBe("Second Comment");
    expect(result.comments[2].body).toBe("Third Comment");
  });
});
