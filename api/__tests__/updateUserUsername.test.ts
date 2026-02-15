import { handler } from "../src/handlers/updateUserUsername";
import { getPool } from "../src/lib/db";
import { getSSMClient } from "../src/lib/ssm";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

jest.mock("../src/lib/db");
jest.mock("../src/lib/ssm");

const mockVerify = jest.fn();
jest.mock("svix", () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: mockVerify,
  })),
}));

describe("updateUserUsername handler", () => {
  let mockQuery: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      SIGNING_SECRET_UPDATE: "test_signing_secret",
      USE_SSL: "false",
    };

    mockQuery = jest.fn().mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: "clerk_user_123",
          username: "newusername",
          bio: "some bio",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-06-15T12:00:00Z",
        },
      ],
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });

    mockVerify.mockReturnValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createEvent = (
    method: string,
    body?: string,
  ): APIGatewayProxyEventV2 => ({
    version: "2.0",
    routeKey: `${method} /users/update/web-hook`,
    rawPath: "/users/update/web-hook",
    rawQueryString: "",
    headers: {
      "svix-id": "msg_test123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,testsignature",
    },
    requestContext: {
      http: {
        method,
        path: "/users/update/web-hook",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "",
      },
      routeKey: `${method} /users/update/web-hook`,
      stage: "$default",
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "example.com",
      domainPrefix: "example",
      requestId: "request-id",
      timeEpoch: Date.now(),
      time: "2023-01-01T00:00:00Z",
    },
    body: body,
    isBase64Encoded: false,
  });

  const context = {} as any;
  const callback = jest.fn();

  const validBody = JSON.stringify({
    type: "user.updated",
    data: {
      id: "clerk_user_123",
      username: "newusername",
    },
  });

  it("should return 200 with empty body for OPTIONS request", async () => {
    const event = createEvent("OPTIONS");

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Headers");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 400 when request body is missing", async () => {
    const event = createEvent("POST", undefined);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Missing request body",
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 400 when id is missing from body", async () => {
    const body = JSON.stringify({
      type: "user.updated",
      data: { username: "newusername" },
    });
    const event = createEvent("POST", body);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid request body",
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 400 when username is missing from body", async () => {
    const body = JSON.stringify({
      type: "user.updated",
      data: { id: "clerk_user_123" },
    });
    const event = createEvent("POST", body);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Invalid request body",
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 200 with 'Event ignored' for non user.updated events", async () => {
    const body = JSON.stringify({
      type: "user.created",
      data: { id: "clerk_user_123", username: "testuser" },
    });
    const event = createEvent("POST", body);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual({ message: "Event ignored" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 200 and update username on valid user.updated event", async () => {
    const event = createEvent("POST", validBody);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual({
      message: "Username updated",
      user: {
        id: "clerk_user_123",
        username: "newusername",
        bio: "some bio",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-15T12:00:00Z",
      },
    });
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      "clerk_user_123",
      "newusername",
    ]);
  });

  it("should create a new user when user is not found (rowCount === 0)", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "clerk_user_456",
            username: "brandnewuser",
            bio: "",
            created_at: "2023-06-15T12:00:00Z",
            updated_at: "2023-06-15T12:00:00Z",
          },
        ],
      });

    const body = JSON.stringify({
      type: "user.updated",
      data: {
        id: "clerk_user_456",
        username: "brandnewuser",
      },
    });
    const event = createEvent("POST", body);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body!)).toEqual({
      message: "User created",
      user: {
        id: "clerk_user_456",
        username: "brandnewuser",
        bio: "",
        created_at: "2023-06-15T12:00:00Z",
        updated_at: "2023-06-15T12:00:00Z",
      },
    });
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery).toHaveBeenNthCalledWith(1, expect.any(String), [
      "clerk_user_456",
      "brandnewuser",
    ]);
    expect(mockQuery).toHaveBeenNthCalledWith(2, expect.any(String), [
      "clerk_user_456",
      "brandnewuser",
      "",
    ]);
  });

  it("should verify the webhook signature", async () => {
    const event = createEvent("POST", validBody);

    await handler(event, context, callback);

    expect(mockVerify).toHaveBeenCalledWith(validBody, {
      "svix-id": "msg_test123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,testsignature",
    });
  });

  it("should return 500 when webhook verification fails", async () => {
    mockVerify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const event = createEvent("POST", validBody);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body!)).toEqual({
      error: "Internal Server Error",
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 500 when database query fails", async () => {
    mockQuery.mockRejectedValue(new Error("Database error"));
    const event = createEvent("POST", validBody);

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

  it("should return 500 when the fallback insert query also fails", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockRejectedValueOnce(new Error("Insert failed"));

    const event = createEvent("POST", validBody);

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

  it("should include CORS headers in successful response", async () => {
    const event = createEvent("POST", validBody);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(response.headers).toHaveProperty("Content-Type", "application/json");
  });

  it("should include CORS headers in error response", async () => {
    const event = createEvent("POST", undefined);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(response.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(response.headers).toHaveProperty("Content-Type", "application/json");
  });

  it("should use SSM to retrieve signing secret when USE_SSL is true", async () => {
    process.env.USE_SSL = "true";
    const mockSend = jest.fn().mockResolvedValue({
      Parameter: { Value: "ssm_signing_secret" },
    });
    (getSSMClient as jest.Mock).mockReturnValue({ send: mockSend });

    const event = createEvent("POST", validBody);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(getSSMClient).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should throw when SSM parameter value is missing", async () => {
    process.env.USE_SSL = "true";
    const mockSend = jest.fn().mockResolvedValue({
      Parameter: { Value: undefined },
    });
    (getSSMClient as jest.Mock).mockReturnValue({ send: mockSend });

    const event = createEvent("POST", validBody);

    await expect(handler(event, context, callback)).rejects.toThrow(
      "SIGNING_SECRET_UPDATE not found in SSM",
    );
  });

  it("should use SIGNING_SECRET_UPDATE env var when USE_SSL is false", async () => {
    process.env.USE_SSL = "false";
    process.env.SIGNING_SECRET_UPDATE = "env_secret";

    const { Webhook } = require("svix");

    const event = createEvent("POST", validBody);
    await handler(event, context, callback);

    expect(Webhook).toHaveBeenCalledWith("env_secret");
    expect(getSSMClient).not.toHaveBeenCalled();
  });

  it("should pass empty strings for missing svix headers", async () => {
    const event = createEvent("POST", validBody);
    event.headers = {};

    await handler(event, context, callback);

    expect(mockVerify).toHaveBeenCalledWith(validBody, {
      "svix-id": "",
      "svix-timestamp": "",
      "svix-signature": "",
    });
  });

  it("should ignore user.deleted events", async () => {
    const body = JSON.stringify({
      type: "user.deleted",
      data: { id: "clerk_user_123", username: "testuser" },
    });
    const event = createEvent("POST", body);

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual({ message: "Event ignored" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should call UPDATE query with correct parameters for username change", async () => {
    const body = JSON.stringify({
      type: "user.updated",
      data: {
        id: "clerk_user_789",
        username: "updated_name",
      },
    });
    const event = createEvent("POST", body);

    mockQuery.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: "clerk_user_789",
          username: "updated_name",
          bio: "",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-06-15T12:00:00Z",
        },
      ],
    });

    const response = (await handler(
      event,
      context,
      callback,
    )) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("UPDATE"), [
      "clerk_user_789",
      "updated_name",
    ]);
    const parsedBody = JSON.parse(response.body!);
    expect(parsedBody.user.username).toBe("updated_name");
  });

  it("should call UPDATE query that sets updated_at", async () => {
    const event = createEvent("POST", validBody);

    await handler(event, context, callback);

    const queryString = mockQuery.mock.calls[0][0];
    expect(queryString).toContain("updated_at");
    expect(queryString).toContain("NOW()");
  });
});
