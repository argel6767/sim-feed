import { handler } from "../src/handlers/getPersonaFollows";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getPersonaFollows Handler", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [{ persona_id: 2, username: "testuser" }],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (
    personaId: string = "1",
    relation: string = "follower",
  ): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /personas/{persona_id}/follows",
    rawPath: `/personas/${personaId}/follows`,
    rawQueryString: `relation=${relation}`,
    headers: {},
    pathParameters: { persona_id: personaId },
    queryStringParameters: { relation },
    requestContext: {
      http: {
        method: "GET",
        path: `/personas/${personaId}/follows`,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /personas/{persona_id}/follows",
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

  it("should return follows for valid persona_id and relation", async () => {
    const event = createEvent("1", "follower");
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toStrictEqual([
      { persona_id: 2, username: "testuser" },
    ]);
  });

  it("should return follows with followed relation", async () => {
    const event = createEvent("2", "followed");
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(
      `
    SELECT p.persona_id, p.username
    FROM follows f
    JOIN personas p ON p.persona_id = f.follower
    WHERE f.followed = $1
  `,
      ["2"],
    );
  });

  it("should return 200 if no relations found", async () => {
    const event = createEvent("99", "follower");
    mockQuery.mockResolvedValue({ rows: [] });
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toStrictEqual([]);
  });

  it("should return 400 if persona_id is missing", async () => {
    const event = createEvent("1", "follower");
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

  it("should return 400 if persona_id is invalid", async () => {
    const event = createEvent("invalid", "follower");
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

  it("should return 400 if relation is missing", async () => {
    const event = createEvent("1", "follower");
    delete event.queryStringParameters!.relation;
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid relation parameter",
    });
  });

  it("should return a 400 if the persona_id is negative", async () => {
    const event = createEvent("-1", "follower");
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

  it("should return 400 if relation is invalid", async () => {
    const event = createEvent("1", "invalid");
    const result = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({
      error: "Bad Request",
      message: "Invalid relation parameter",
    });
  });
});
