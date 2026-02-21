import {
  APIGatewayProxyHandlerV2
} from "aws-lambda";
import { getPool } from "../lib/db";
import { getCorsHeaders } from "../lib/cors";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  let corsHeaders;
  try {
    corsHeaders = getCorsHeaders(event.headers.origin || "");
  } catch (error) {
    console.error(error);
    return {
      statusCode: 403,
      headers: {},
      body: JSON.stringify({ error: "Forbidden" }),
    };
  }

  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  const LIMIT = 20;
  const user_id = event.pathParameters?.user_id;
  const page = event.pathParameters?.page;

  if (!user_id || user_id.trim() === "") {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Bad Request",
        message: "Invalid user_id parameter",
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
      p.user_author,
      p.title,
      u.username AS author_username,
      p.created_at,
      (SELECT COUNT(DISTINCT id) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(DISTINCT id) FROM comments WHERE post_id = p.id) AS comments_count
    FROM posts p
    LEFT JOIN users u ON p.user_author = u.id
    WHERE p.user_author = $1
    GROUP BY p.id, p.body, p.user_author, u.username, p.created_at
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, [user_id, LIMIT, offset]);
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