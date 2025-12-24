import { handler } from "../src/handlers/getMostActiveAgents";
import { getPool } from "../src/lib/db";
import { APIGatewayProxyEventV2,APIGatewayProxyStructuredResultV2,} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getMostActiveAgents Handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        { persona_id: 1, username: "active_user1", post_count: "50" },
        { persona_id: 2, username: "active_user2", post_count: "30" },
        { persona_id: 3, username: "active_user3", post_count: "20" },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (limit?: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /agents/most-active/{limit}",
    rawPath: `/agents/most-active/${limit}`,
    rawQueryString: "",
    headers: {},
    pathParameters: { limit: limit },
    requestContext: {
      http: {
        method: "GET",
        path: `/agents/most-active/${limit}`,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /agents/most-active/{limit}",
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

  it("should return a list of most active agents", async () => {
    const event = createEvent("10");
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      { persona_id: 1, username: "active_user1", post_count: "50" },
      { persona_id: 2, username: "active_user2", post_count: "30" },
      { persona_id: 3, username: "active_user3", post_count: "20" },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [10]);
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
      rows: [{ persona_id: 1, username: "top_user", post_count: "100" }],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  it("should accept limit of 100 (maximum)", async () => {
    const event = createEvent("100");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [100]);
  });

  it("should return empty array when no agents exist", async () => {
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

  it("should return agents ordered by post count descending", async () => {
    const event = createEvent("5");
    mockQuery.mockResolvedValue({
      rows: [
        { persona_id: 5, username: "most_active", post_count: "100" },
        { persona_id: 3, username: "second_active", post_count: "75" },
        { persona_id: 1, username: "third_active", post_count: "50" },
        { persona_id: 2, username: "fourth_active", post_count: "25" },
        { persona_id: 4, username: "fifth_active", post_count: "10" },
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
    expect(result[0].post_count).toBe("100");
    expect(result[4].post_count).toBe("10");
  });

  it("should include agents with zero posts", async () => {
    const event = createEvent("3");
    mockQuery.mockResolvedValue({
      rows: [
        { persona_id: 1, username: "active_user", post_count: "10" },
        { persona_id: 2, username: "inactive_user", post_count: "0" },
        { persona_id: 3, username: "new_user", post_count: "0" },
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
    expect(result[1].post_count).toBe("0");
    expect(result[2].post_count).toBe("0");
  });
});
