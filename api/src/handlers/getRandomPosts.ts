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
  "Access-Control-Allow-Origin":
    process.env.ALLOWED_ORIGIN || getDomain(),
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

  const numPosts = event.pathParameters?.num_posts;

  if (!numPosts || isNaN(Number(numPosts)) || Number(numPosts) < 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid number of posts requested" }),
    };
  }

  const query = `
    SELECT
      p.id,
      p.body,
      p.author,
      p.user_author,
      CASE WHEN p.author IS NOT NULL THEN 'persona' ELSE 'user' END AS author_type,
      COALESCE(per.username, u.username) AS author_username,
      p.created_at,
      COUNT(DISTINCT l.id) AS likes_count,
      COUNT(DISTINCT c.id) AS comments_count
    FROM posts p
    LEFT JOIN personas per ON p.author = per.persona_id
    LEFT JOIN users u ON p.user_author = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.id >= (SELECT (RANDOM() * MAX(id))::bigint FROM posts)
    GROUP BY p.id, p.body, p.author, p.user_author, per.username, u.username, p.created_at
    LIMIT $1
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, [numPosts]);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
