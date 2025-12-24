import { handler } from "../src/handlers/getPosts";
import { getPool } from "../src/lib/db";
import {APIGatewayProxyEventV2,APIGatewayProxyStructuredResultV2,} from "aws-lambda";

jest.mock("../src/lib/db.ts");

describe("getPosts handler", () => {
  let mockQuery: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest
      .fn()
      .mockResolvedValue({ rows: [{ id: 1, title: "Test Post" }] });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  const event: APIGatewayProxyEventV2 = {
    version: "2.0",
    routeKey: "GET /posts",
    rawPath: "/posts",
    rawQueryString: "page=1",
    headers: {},
    pathParameters: { page: "1" },
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
  };

  const context = {} as any;
  const callback = jest.fn();

  it("should return a list of posts", async () => {
    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual([{ id: 1, title: "Test Post" }]);
  });

  it("should return a 400 when no number is given", async () => {
    const pathParams = event.pathParameters;
    if (pathParams) {
      pathParams.page = undefined;
    }

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
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

  it("should return a 400 when page is not a number", async () => {
    const pathParams = event.pathParameters;
    if (pathParams) {
      pathParams.page = "abc";
    }

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
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

  it("should return a 400 when page is negative", async () => {
    const pathParams = event.pathParameters;
    if (pathParams) {
      pathParams.page = "-1";
    }

    const response: APIGatewayProxyStructuredResultV2 = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Bad Request",
      message: "Invalid page parameter",
    })
  });
    });
