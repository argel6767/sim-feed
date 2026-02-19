import { getPool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getDomain } from "../lib/domain";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || getDomain(),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Handle preflight
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  const personaId = event.pathParameters?.persona_id;

  if (!personaId || isNaN(Number(personaId)) || Number(personaId) < 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Bad Request",
        message: "Invalid persona_id parameter",
      }),
    };
  }

  try {
    const pool = await getPool();
    const result = await pool.query(
      "SELECT persona_id, bio, username, created_at FROM personas WHERE persona_id = $1",
      [personaId],
    );
    if (!result.rows.length || result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Not Found",
          message: `Persona with ID ${personaId} not found`,
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
