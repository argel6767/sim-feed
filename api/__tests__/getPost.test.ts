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
          title: "Test Post 1",
          body: "Test Post 1",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "5",
          comments: [
            {
              id: 1,
              body: "Test Comment 1",
              author_id: 2,
              user_author_id: null,
              author_type: "persona",
              author_username: "commenter1",
              created_at: "2023-01-01T01:00:00Z",
            },
            {
              id: 2,
              body: "Test Comment 2",
              author_id: 3,
              user_author_id: null,
              author_type: "persona",
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

  it("should return a single persona-authored post with comments", async () => {
    const event = createEvent("1");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toEqual({
      id: 1,
      title: "Test Post 1",
      body: "Test Post 1",
      author: 1,
      user_author: null,
      author_type: "persona",
      author_username: "testuser",
      created_at: "2023-01-01T00:00:00Z",
      likes_count: "5",
      comments: [
        {
          id: 1,
          body: "Test Comment 1",
          author_id: 2,
          user_author_id: null,
          author_type: "persona",
          author_username: "commenter1",
          created_at: "2023-01-01T01:00:00Z",
        },
        {
          id: 2,
          body: "Test Comment 2",
          author_id: 3,
          user_author_id: null,
          author_type: "persona",
          author_username: "commenter2",
          created_at: "2023-01-01T02:00:00Z",
        },
      ],
    });
    expect(result.author_type).toBe("persona");
    expect(result.user_author).toBeNull();
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["1"]);
  });

  it("should return a user-authored post with user-authored comments", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 10,
          title: "User Post",
          body: "A post by a real user",
          author: null,
          user_author: "clerk_user_123",
          author_type: "user",
          author_username: "realuser",
          created_at: "2023-02-01T00:00:00Z",
          likes_count: "3",
          comments: [
            {
              id: 5,
              body: "User comment",
              author_id: null,
              user_author_id: "clerk_user_456",
              author_type: "user",
              author_username: "anotheruser",
              created_at: "2023-02-01T01:00:00Z",
            },
          ],
        },
      ],
    });

    const event = createEvent("10");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result.author).toBeNull();
    expect(result.user_author).toBe("clerk_user_123");
    expect(result.author_type).toBe("user");
    expect(result.author_username).toBe("realuser");
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].author_id).toBeNull();
    expect(result.comments[0].user_author_id).toBe("clerk_user_456");
    expect(result.comments[0].author_type).toBe("user");
    expect(result.comments[0].author_username).toBe("anotheruser");
  });

  it("should return a persona-authored post with mixed comments from personas and users", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 20,
          title: "Mixed Comments Post",
          body: "A post with mixed comment authors",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "persona_author",
          created_at: "2023-03-01T00:00:00Z",
          likes_count: "7",
          comments: [
            {
              id: 10,
              body: "Persona comment",
              author_id: 2,
              user_author_id: null,
              author_type: "persona",
              author_username: "persona_commenter",
              created_at: "2023-03-01T01:00:00Z",
            },
            {
              id: 11,
              body: "User comment",
              author_id: null,
              user_author_id: "clerk_user_789",
              author_type: "user",
              author_username: "user_commenter",
              created_at: "2023-03-01T02:00:00Z",
            },
          ],
        },
      ],
    });

    const event = createEvent("20");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result.author_type).toBe("persona");
    expect(result.comments).toHaveLength(2);
    expect(result.comments[0].author_type).toBe("persona");
    expect(result.comments[0].author_id).toBe(2);
    expect(result.comments[0].user_author_id).toBeNull();
    expect(result.comments[1].author_type).toBe("user");
    expect(result.comments[1].author_id).toBeNull();
    expect(result.comments[1].user_author_id).toBe("clerk_user_789");
  });

  it("should return a post with empty comments array when post has no comments", async () => {
    const event = createEvent("2");
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 2,
          title: "Test Post Without Comments",
          body: "Test Post Without Comments",
          author: 5,
          user_author: null,
          author_type: "persona",
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
      title: "Test Post Without Comments",
      body: "Test Post Without Comments",
      author: 5,
      user_author: null,
      author_type: "persona",
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
          title: "Test Post with Large ID",
          body: "Test Post with Large ID",
          author: 1,
          user_author: null,
          author_type: "persona",
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
          title: "Test Post",
          body: "Test Post",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "testuser",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "3",
          comments: [
            {
              id: 1,
              body: "First Comment",
              author_id: 2,
              user_author_id: null,
              author_type: "persona",
              author_username: "user2",
              created_at: "2023-01-01T01:00:00Z",
            },
            {
              id: 2,
              body: "Second Comment",
              author_id: null,
              user_author_id: "clerk_user_abc",
              author_type: "user",
              author_username: "user3",
              created_at: "2023-01-01T02:00:00Z",
            },
            {
              id: 3,
              body: "Third Comment",
              author_id: 4,
              user_author_id: null,
              author_type: "persona",
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
    expect(result.comments[0].author_type).toBe("persona");
    expect(result.comments[1].body).toBe("Second Comment");
    expect(result.comments[1].author_type).toBe("user");
    expect(result.comments[2].body).toBe("Third Comment");
    expect(result.comments[2].author_type).toBe("persona");
  });

  it("should return a user-authored post with no comments", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 50,
          title: "Lonely User Post",
          body: "No one commented",
          author: null,
          user_author: "clerk_lonely",
          author_type: "user",
          author_username: "lonelyuser",
          created_at: "2023-04-01T00:00:00Z",
          likes_count: "0",
          comments: [],
        },
      ],
    });

    const event = createEvent("50");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result.author).toBeNull();
    expect(result.user_author).toBe("clerk_lonely");
    expect(result.author_type).toBe("user");
    expect(result.comments).toEqual([]);
  });
});
