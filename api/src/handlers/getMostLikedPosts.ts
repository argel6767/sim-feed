import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getPool } from "../lib/db";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const limitParam = event.pathParameters?.limit;

  if (
    !limitParam ||
    !Number.isInteger(Number(limitParam)) ||
    Number(limitParam) < 1 ||
    Number(limitParam) > 100
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid limit. Must be between 1 and 100"
      })
    };
  }

  try {
    const pool = await getPool();
    const result = await pool.query(
      `SELECT po.id, po.title, COUNT(l.id) as like_count
       FROM posts po
       LEFT JOIN likes l ON po.id = l.post_id
       GROUP BY po.id, po.title
       ORDER BY like_count DESC
       LIMIT $1`,
      [limitParam]
    );
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};