import { handler } from "../src/handlers/getPostsWithComments";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getPostsWithComments Handler", () => {
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
          author_username: "persona_user",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "2",
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
        {
          id: 2,
          title: "Test Post 2",
          body: "Test Post 2",
          author: 2,
          user_author: null,
          author_type: "persona",
          author_username: "persona_user2",
          created_at: "2023-01-02T00:00:00Z",
          likes_count: "0",
          comments: null,
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (page?: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts/comments",
    rawPath: "/posts/comments",
    rawQueryString: "",
    headers: {},
    pathParameters: { page: page },
    requestContext: {
      http: {
        method: "GET",
        path: "/posts/comments",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /posts/comments",
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

  it("should return posts with comments for page 1", async () => {
    const event = createEvent("1");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      {
        id: 1,
        title: "Test Post 1",
        body: "Test Post 1",
        author: 1,
        user_author: null,
        author_type: "persona",
        author_username: "persona_user",
        created_at: "2023-01-01T00:00:00Z",
        likes_count: "2",
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
      {
        id: 2,
        title: "Test Post 2",
        body: "Test Post 2",
        author: 2,
        user_author: null,
        author_type: "persona",
        author_username: "persona_user2",
        created_at: "2023-01-02T00:00:00Z",
        likes_count: "0",
        comments: null,
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [20, 0]);
  });

  it("should return user-authored posts with user-authored comments", async () => {
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
          likes_count: "5",
          comments: [
            {
              id: 5,
              body: "User comment on user post",
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

    const event = createEvent("1");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(1);
    expect(result[0].author).toBeNull();
    expect(result[0].user_author).toBe("clerk_user_123");
    expect(result[0].author_type).toBe("user");
    expect(result[0].author_username).toBe("realuser");
    expect(result[0].comments).toHaveLength(1);
    expect(result[0].comments[0].author_id).toBeNull();
    expect(result[0].comments[0].user_author_id).toBe("clerk_user_456");
    expect(result[0].comments[0].author_type).toBe("user");
    expect(result[0].comments[0].author_username).toBe("anotheruser");
  });

  it("should return a mix of persona-authored and user-authored posts with mixed comments", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 1,
          title: "Persona Post",
          body: "A persona post",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "persona_author",
          created_at: "2023-03-02T00:00:00Z",
          likes_count: "3",
          comments: [
            {
              id: 10,
              body: "Persona comment",
              author_id: 2,
              user_author_id: null,
              author_type: "persona",
              author_username: "persona_commenter",
              created_at: "2023-03-02T01:00:00Z",
            },
            {
              id: 11,
              body: "User comment on persona post",
              author_id: null,
              user_author_id: "clerk_user_789",
              author_type: "user",
              author_username: "user_commenter",
              created_at: "2023-03-02T02:00:00Z",
            },
          ],
        },
        {
          id: 2,
          title: "User Post",
          body: "A user post",
          author: null,
          user_author: "clerk_user_abc",
          author_type: "user",
          author_username: "user_author",
          created_at: "2023-03-01T00:00:00Z",
          likes_count: "7",
          comments: [
            {
              id: 12,
              body: "Persona comment on user post",
              author_id: 3,
              user_author_id: null,
              author_type: "persona",
              author_username: "persona_on_user_post",
              created_at: "2023-03-01T01:00:00Z",
            },
          ],
        },
      ],
    });

    const event = createEvent("1");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(2);

    // First post: persona-authored
    expect(result[0].author_type).toBe("persona");
    expect(result[0].author).toBe(1);
    expect(result[0].user_author).toBeNull();
    expect(result[0].comments).toHaveLength(2);
    expect(result[0].comments[0].author_type).toBe("persona");
    expect(result[0].comments[0].author_id).toBe(2);
    expect(result[0].comments[0].user_author_id).toBeNull();
    expect(result[0].comments[1].author_type).toBe("user");
    expect(result[0].comments[1].author_id).toBeNull();
    expect(result[0].comments[1].user_author_id).toBe("clerk_user_789");

    // Second post: user-authored
    expect(result[1].author_type).toBe("user");
    expect(result[1].author).toBeNull();
    expect(result[1].user_author).toBe("clerk_user_abc");
    expect(result[1].comments).toHaveLength(1);
    expect(result[1].comments[0].author_type).toBe("persona");
    expect(result[1].comments[0].author_id).toBe(3);
    expect(result[1].comments[0].user_author_id).toBeNull();
  });

  it("should calculate correct offset for page 2", async () => {
    const event = createEvent("2");
    (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [20, 20]);
  });

  it("should calculate correct offset for page 3", async () => {
    const event = createEvent("3");
    (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [20, 40]);
  });

  it("should return 400 when page parameter is missing", async () => {
    const event = createEvent();
    delete event.pathParameters!.page;

    const response = (await handler(
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

  it("should return 400 when page parameter is not a number", async () => {
    const event = createEvent("abc");

    const response = (await handler(
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

  it("should return 400 when page parameter is an empty string", async () => {
    const event = createEvent("");

    const response = (await handler(
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

  it("should return empty array when no posts exist", async () => {
    const event = createEvent("1");
    mockQuery.mockResolvedValue({ rows: [] });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([]);
  });

  it("should return post with empty array for comments when post has no comments", async () => {
    const event = createEvent("1");
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 3,
          title: "Test Post Without Comments",
          body: "Test Post Without Comments",
          author: 5,
          user_author: null,
          author_type: "persona",
          author_username: "lonely_persona",
          created_at: "2023-01-03T00:00:00Z",
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
    expect(result).toEqual([
      {
        id: 3,
        title: "Test Post Without Comments",
        body: "Test Post Without Comments",
        author: 5,
        user_author: null,
        author_type: "persona",
        author_username: "lonely_persona",
        created_at: "2023-01-03T00:00:00Z",
        likes_count: "0",
        comments: [],
      },
    ]);
    expect(result[0].comments).toEqual([]);
    expect(result[0].comments).not.toBeNull();
  });

  it("should return user-authored post with empty comments", async () => {
    const event = createEvent("1");
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

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(1);
    expect(result[0].author).toBeNull();
    expect(result[0].user_author).toBe("clerk_lonely");
    expect(result[0].author_type).toBe("user");
    expect(result[0].comments).toEqual([]);
  });

  it("should return 500 when database query fails", async () => {
    const event = createEvent("1");
    mockQuery.mockRejectedValue(new Error("Database connection failed"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const response = (await handler(
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
