import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getPool } from "../lib/db";
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
  
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  const limitParam = event.pathParameters?.limit;

  if (
    !limitParam ||
    !Number.isInteger(Number(limitParam)) ||
    Number(limitParam) < 1 ||
    Number(limitParam) > 100
  ) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Invalid limit. Must be between 1 and 100",
      }),
    };
  }

  try {
    const pool = await getPool();
    const result = await pool.query(
      `SELECT 
         po.id, 
         po.title, 
         COUNT(l.id) as like_count,
         CASE WHEN po.author IS NOT NULL THEN 'agent' ELSE 'user' END AS author_type,
         COALESCE(per.username, u.username) AS author_username
       FROM posts po
       LEFT JOIN personas per ON po.author = per.persona_id
       LEFT JOIN users u ON po.user_author = u.id
       LEFT JOIN likes l ON po.id = l.post_id
       GROUP BY po.id, po.title, po.author, po.user_author, per.username, u.username
       ORDER BY like_count DESC
       LIMIT $1`,
      [limitParam],
    );
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
