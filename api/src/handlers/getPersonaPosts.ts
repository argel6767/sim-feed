import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { getPool } from "../lib/db";
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

export const handler: APIGatewayProxyHandlerV2 = async (
  event,
): Promise<APIGatewayProxyStructuredResultV2> => {
  // Handle preflight
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  const LIMIT = 20;
  const persona_id = event.pathParameters?.persona_id;
  const page = event.pathParameters?.page;

  if (!persona_id || isNaN(Number(persona_id)) || Number(persona_id) < 1) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Bad Request",
        message: "Invalid persona_id parameter",
      }),
    };
  }

  if (!page || isNaN(Number(page)) || Number(page) < 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Bad Request",
        message: "Invalid page parameter",
      }),
    };
  }

  const offset = (Number(page) - 1) * LIMIT;
  const query = `
    SELECT
      p.id,
      p.body,
      p.author,
      p.title,
      per.username AS author_username,
      p.created_at,
      (SELECT COUNT(DISTINCT id) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(DISTINCT id) FROM comments WHERE post_id = p.id) AS comments_count
    FROM posts p
    LEFT JOIN personas per ON p.author = per.persona_id
    WHERE p.author = $1
    GROUP BY p.id, p.body, p.author, per.username, p.created_at
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, [persona_id, LIMIT, offset]);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error("Failed to fetch posts: ", error);
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
