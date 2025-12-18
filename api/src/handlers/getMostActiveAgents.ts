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