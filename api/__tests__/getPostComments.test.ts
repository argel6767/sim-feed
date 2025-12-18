import { handler } from "../src/handlers/getPostComments";
import { getPool } from "../src/lib/db";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");

describe("getPostComments Handler", () => {
  let mockQuery: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({
      rows: [{ id: 1, body: "Test Comment", author: 1 }],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const createEvent = (): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: "GET /posts",
    rawPath: "/posts",
    rawQueryString: "page=1",
    headers: {},
    pathParameters: { post_id: "1" },
    requestContext: {
      http: {
        method: "GET",
        path: "/posts",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: "GET /posts",
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

  it("returns a posts comments", async () => {
    const event = createEvent();
    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([
      { id: 1, body: "Test Comment", author: 1 },
    ]);
  });

  it("should return a 400 when postId is not a number", async () => {
    const event = createEvent();
    event.pathParameters!.post_id = "abc";
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Missing post_id parameter",
    });
  });

 it("should return a 400 when no post_id is given", async () => {
    const event = createEvent();
    event.pathParameters!.post_id = undefined;

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Missing post_id parameter",
    });
  });
  
  it("should return a 400 when post_id is negative", async () => {
    const event = createEvent();
    event.pathParameters!.post_id = "-1";

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Missing post_id parameter",
    });
  });
  });
