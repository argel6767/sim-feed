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
          created_at: "2023-01-01T00:00:00Z",
        },
        {
          id: 5,
          body: "Random Post 2",
          author: 2,
          created_at: "2023-01-02T00:00:00Z",
        },
        {
          id: 10,
          body: "Random Post 3",
          author: 3,
          created_at: "2023-01-03T00:00:00Z",
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

  it("should return random posts for valid num_posts", async () => {
    const event = createEvent("3");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      {
        id: 1,
        body: "Random Post 1",
        author: 1,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 5,
        body: "Random Post 2",
        author: 2,
        created_at: "2023-01-02T00:00:00Z",
      },
      {
        id: 10,
        body: "Random Post 3",
        author: 3,
        created_at: "2023-01-03T00:00:00Z",
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["3"]);
  });

  it("should return single random post when num_posts is 1", async () => {
    const event = createEvent("1");
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 7,
          body: "Single Random Post",
          author: 4,
          created_at: "2023-01-04T00:00:00Z",
        },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      {
        id: 7,
        body: "Single Random Post",
        author: 4,
        created_at: "2023-01-04T00:00:00Z",
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["1"]);
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
        author: (i % 10) + 1,
        created_at: `2023-01-01T00:00:00Z`,
      })),
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!).length).toBe(100);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["100"]);
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
