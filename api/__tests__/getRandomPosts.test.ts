import { handler } from "../src/handlers/getRandomPosts";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getRandomPosts Handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          body: "Random Post 1",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "persona_user1",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "3",
          comments_count: "1",
        },
        {
          id: 5,
          body: "Random Post 2",
          author: 2,
          user_author: null,
          author_type: "persona",
          author_username: "persona_user2",
          created_at: "2023-01-02T00:00:00Z",
          likes_count: "0",
          comments_count: "0",
        },
        {
          id: 10,
          body: "Random Post 3",
          author: null,
          user_author: "clerk_user_abc",
          author_type: "user",
          author_username: "realuser",
          created_at: "2023-01-03T00:00:00Z",
          likes_count: "7",
          comments_count: "2",
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (numPosts?: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts/random/{num_posts}",
    rawPath: `/posts/random/${numPosts}`,
    rawQueryString: "",
    headers: {},
    pathParameters: { num_posts: numPosts },
    requestContext: {
      http: {
        method: "GET",
        path: `/posts/random/${numPosts}`,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /posts/random/{num_posts}",
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

  it("should return random posts with both persona and user authors", async () => {
    const event = createEvent("3");
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
        body: "Random Post 1",
        author: 1,
        user_author: null,
        author_type: "persona",
        author_username: "persona_user1",
        created_at: "2023-01-01T00:00:00Z",
        likes_count: "3",
        comments_count: "1",
      },
      {
        id: 5,
        body: "Random Post 2",
        author: 2,
        user_author: null,
        author_type: "persona",
        author_username: "persona_user2",
        created_at: "2023-01-02T00:00:00Z",
        likes_count: "0",
        comments_count: "0",
      },
      {
        id: 10,
        body: "Random Post 3",
        author: null,
        user_author: "clerk_user_abc",
        author_type: "user",
        author_username: "realuser",
        created_at: "2023-01-03T00:00:00Z",
        likes_count: "7",
        comments_count: "2",
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["3"]);
  });

  it("should return persona-authored posts with correct fields", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 1,
          body: "Persona Post",
          author: 1,
          user_author: null,
          author_type: "persona",
          author_username: "persona_user",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "5",
          comments_count: "2",
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
    expect(result[0].author).toBe(1);
    expect(result[0].user_author).toBeNull();
    expect(result[0].author_type).toBe("persona");
    expect(result[0].author_username).toBe("persona_user");
  });

  it("should return user-authored posts with correct fields", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 7,
          body: "Single Random User Post",
          author: null,
          user_author: "clerk_user_456",
          author_type: "user",
          author_username: "realuser",
          created_at: "2023-01-04T00:00:00Z",
          likes_count: "10",
          comments_count: "3",
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
    expect(result[0].user_author).toBe("clerk_user_456");
    expect(result[0].author_type).toBe("user");
    expect(result[0].author_username).toBe("realuser");
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["1"]);
  });

  it("should return a mix of persona-authored and user-authored posts", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 1,
          body: "Persona Post",
          author: 3,
          user_author: null,
          author_type: "persona",
          author_username: "persona_name",
          created_at: "2023-01-01T00:00:00Z",
          likes_count: "2",
          comments_count: "1",
        },
        {
          id: 2,
          body: "User Post",
          author: null,
          user_author: "clerk_xyz",
          author_type: "user",
          author_username: "user_name",
          created_at: "2023-01-02T00:00:00Z",
          likes_count: "8",
          comments_count: "4",
        },
      ],
    });

    const event = createEvent("2");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(2);
    expect(result[0].author_type).toBe("persona");
    expect(result[0].author).toBe(3);
    expect(result[0].user_author).toBeNull();
    expect(result[1].author_type).toBe("user");
    expect(result[1].author).toBeNull();
    expect(result[1].user_author).toBe("clerk_xyz");
  });

  it("should return empty array when no posts exist", async () => {
    const event = createEvent("5");
    mockQuery.mockResolvedValue({ rows: [] });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([]);
  });

  it("should return 400 when num_posts is missing", async () => {
    const event = createEvent();
    delete event.pathParameters!.num_posts;

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid number of posts requested",
    });
  });

  it("should return 400 when num_posts is not a number", async () => {
    const event = createEvent("abc");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid number of posts requested",
    });
  });

  it("should return 400 when num_posts is negative", async () => {
    const event = createEvent("-5");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid number of posts requested",
    });
  });

  it("should return 400 when num_posts is an empty string", async () => {
    const event = createEvent("");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid number of posts requested",
    });
  });

  it("should handle large num_posts values", async () => {
    const event = createEvent("100");
    mockQuery.mockResolvedValue({
      rows: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        body: `Random Post ${i + 1}`,
        author: i % 2 === 0 ? (i % 10) + 1 : null,
        user_author: i % 2 === 1 ? `clerk_user_${i}` : null,
        author_type: i % 2 === 0 ? "persona" : "user",
        author_username: i % 2 === 0 ? `persona_${i}` : `user_${i}`,
        created_at: "2023-01-01T00:00:00Z",
        likes_count: `${i}`,
        comments_count: `${i % 5}`,
      })),
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result.length).toBe(100);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["100"]);

    // Verify alternating author types
    expect(result[0].author_type).toBe("persona");
    expect(result[0].author).not.toBeNull();
    expect(result[0].user_author).toBeNull();
    expect(result[1].author_type).toBe("user");
    expect(result[1].author).toBeNull();
    expect(result[1].user_author).not.toBeNull();
  });

  it("should return 500 on database error", async () => {
    const event = createEvent("3");
    mockQuery.mockRejectedValue(new Error("Database connection failed"));

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Internal Server Error",
    });
  });
});
