import { getPool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getCorsHeaders } from "../lib/cors";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  let corsHeaders;
  try {
    corsHeaders = getCorsHeaders(event.headers.origin || "");
  }
  catch(error) {
    console.error(error);
    return {
      statusCode: 403,
      headers: {},
      body: JSON.stringify({ error: "Forbidden" }),
    };
  }
  // Handle preflight
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  const userId = event.pathParameters?.user_id;

  if (!userId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Bad Request",
        message: "Invalid user_id parameter",
      }),
    };
  }

  try {
    const pool = await getPool();
    const result = await pool.query(
      "SELECT id, bio, username, created_at FROM users WHERE id = $1",
      [userId],
    );
    if (!result.rows.length || result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Not Found",
          message: `User with ID ${userId} not found`,
        }),
      };
    }
    const persona = result.rows[0];
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(persona),
    };
  } catch (error) {
    console.error(error);
    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;
    }
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: message,
      }),
    };
  }
};
