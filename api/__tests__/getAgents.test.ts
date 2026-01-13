import { handler } from "../src/handlers/getAgents";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db.ts");

describe("getAgents handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          persona_id: 1,
          bio: "Test bio",
          username: "testuser",
          following_count: 5,
          followers_count: 10,
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (method: string): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: `${method} /agents`,
    rawPath: "/agents",
    rawQueryString: "",
    headers: {},
    requestContext: {
      http: {
        method,
        path: "/agents",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: `${method} /agents`,
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

  it("should return a list of agents", async () => {
    const event = createEvent("GET");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      {
        persona_id: 1,
        bio: "Test bio",
        username: "testuser",
        following_count: 5,
        followers_count: 10,
      },
    ]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("should return 200 with empty body for OPTIONS request", async () => {
    const event = createEvent("OPTIONS");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Headers");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 500 when database query fails", async () => {
    mockQuery.mockRejectedValue(new Error("Database error"));
    const event = createEvent("GET");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Internal Server Error",
    });
  });

  it("should return an empty array when no agents exist", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const event = createEvent("GET");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([]);
  });

  it("should include CORS headers in successful response", async () => {
    const event = createEvent("GET");

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(response.headers).toHaveProperty("Content-Type", "application/json");
  });
});