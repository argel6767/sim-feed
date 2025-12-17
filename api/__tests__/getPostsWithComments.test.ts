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
          body: "Test Post 1",
          author: 1,
          created_at: "2023-01-01T00:00:00Z",
          comments: [
            {
              id: 1,
              body: "Test Comment 1",
              author_id: 2,
              created_at: "2023-01-01T01:00:00Z",
            },
            {
              id: 2,
              body: "Test Comment 2",
              author_id: 3,
              created_at: "2023-01-01T02:00:00Z",
            },
          ],
        },
        {
          id: 2,
          body: "Test Post 2",
          author: 2,
          created_at: "2023-01-02T00:00:00Z",
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
        body: "Test Post 1",
        author: 1,
        created_at: "2023-01-01T00:00:00Z",
        comments: [
          {
            id: 1,
            body: "Test Comment 1",
            author_id: 2,
            created_at: "2023-01-01T01:00:00Z",
          },
          {
            id: 2,
            body: "Test Comment 2",
            author_id: 3,
            created_at: "2023-01-01T02:00:00Z",
          },
        ],
      },
      {
        id: 2,
        body: "Test Post 2",
        author: 2,
        created_at: "2023-01-02T00:00:00Z",
        comments: null,
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [20, 0]);
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
      message: "Missing page parameter",
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
      message: "Missing page parameter",
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
      message: "Missing page parameter",
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
          body: "Test Post Without Comments",
          author: 5,
          created_at: "2023-01-03T00:00:00Z",
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
        body: "Test Post Without Comments",
        author: 5,
        created_at: "2023-01-03T00:00:00Z",
        comments: [],
      },
    ]);
    expect(result[0].comments).toEqual([]);
    expect(result[0].comments).not.toBeNull();
  });
});
