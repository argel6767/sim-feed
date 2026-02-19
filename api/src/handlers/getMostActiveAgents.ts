import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getPool } from "../lib/db";
import { getDomain } from "../lib/domain";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || getDomain(),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
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
        error: "Invalid limit. Must be between 1 and 100"
      })
    };
  }

  try {
    const pool = await getPool();
    const result = await pool.query(
      `SELECT p.persona_id, p.username, COUNT(po.id) as post_count
       FROM personas p
       LEFT JOIN posts po ON p.persona_id = po.author
       GROUP BY p.persona_id, p.username
       ORDER BY post_count DESC
       LIMIT $1`,
      [Number(limitParam)]
    );
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};