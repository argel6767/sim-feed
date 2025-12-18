import { handler } from "../src/handlers/getMostLikedPosts";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getMostLikedPosts Handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        { id: 1, title: "Popular Post 1", like_count: "100" },
        { id: 2, title: "Popular Post 2", like_count: "75" },
        { id: 3, title: "Popular Post 3", like_count: "50" },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (limit?: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts/most-liked/{limit}",
    rawPath: `/posts/most-liked/${limit}`,
    rawQueryString: "",
    headers: {},
    pathParameters: { limit: limit },
    requestContext: {
      http: {
        method: "GET",
        path: `/posts/most-liked/${limit}`,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /posts/most-liked/{limit}",
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

  it("should return a list of most liked posts", async () => {
    const event = createEvent("10");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      { id: 1, title: "Popular Post 1", like_count: "100" },
      { id: 2, title: "Popular Post 2", like_count: "75" },
      { id: 3, title: "Popular Post 3", like_count: "50" },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["10"]);
  });

  it("should return 400 when limit parameter is missing", async () => {
    const event = createEvent();
    delete event.pathParameters!.limit;

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should return 400 when limit is not a number", async () => {
    const event = createEvent("abc");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should return 400 when limit is zero", async () => {
    const event = createEvent("0");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should return 400 when limit is negative", async () => {
    const event = createEvent("-5");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should return 400 when limit exceeds 100", async () => {
    const event = createEvent("101");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should return 400 when limit is a decimal number", async () => {
    const event = createEvent("5.5");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should return 400 when limit is an empty string", async () => {
    const event = createEvent("");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid limit. Must be between 1 and 100",
    });
  });

  it("should accept limit of 1 (minimum)", async () => {
    const event = createEvent("1");
    mockQuery.mockResolvedValue({
      rows: [{ id: 1, title: "Top Post", like_count: "500" }],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["1"]);
  });

  it("should accept limit of 100 (maximum)", async () => {
    const event = createEvent("100");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["100"]);
  });

  it("should return empty array when no posts exist", async () => {
    const event = createEvent("10");
    mockQuery.mockResolvedValue({ rows: [] });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([]);
  });

  it("should return 500 when database query fails", async () => {
    const event = createEvent("10");
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
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should return posts ordered by like count descending", async () => {
    const event = createEvent("5");
    mockQuery.mockResolvedValue({
      rows: [
        { id: 5, title: "Most Liked", like_count: "1000" },
        { id: 3, title: "Second Most Liked", like_count: "750" },
        { id: 1, title: "Third Most Liked", like_count: "500" },
        { id: 2, title: "Fourth Most Liked", like_count: "250" },
        { id: 4, title: "Fifth Most Liked", like_count: "100" },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(5);
    expect(result[0].like_count).toBe("1000");
    expect(result[4].like_count).toBe("100");
  });

  it("should include posts with zero likes", async () => {
    const event = createEvent("3");
    mockQuery.mockResolvedValue({
      rows: [
        { id: 1, title: "Popular Post", like_count: "50" },
        { id: 2, title: "Unpopular Post", like_count: "0" },
        { id: 3, title: "New Post", like_count: "0" },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(3);
    expect(result[1].like_count).toBe("0");
    expect(result[2].like_count).toBe("0");
  });

  it("should handle posts with null titles", async () => {
    const event = createEvent("2");
    mockQuery.mockResolvedValue({
      rows: [
        { id: 1, title: null, like_count: "25" },
        { id: 2, title: "Post with Title", like_count: "10" },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body!);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBeNull();
  });
});
