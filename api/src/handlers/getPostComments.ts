import { getPool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const postId = event.pathParameters?.post_id;

  if (!postId || isNaN(Number(postId)) || Number(postId) < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request', message: 'Missing post_id parameter' }),
    };
  }
  const query = `
    SELECT
      c.id,
      c.post_id,
      c.body,
      c.author_id,
      per.username AS author_username,
      c.created_at
    FROM comments c
    LEFT JOIN personas per ON c.author_id = per.persona_id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, [postId]);
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error("Failed to fetch comments: ", error);
    let message = "Internal Server Error";
    
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: message }),
    };
  }
};
