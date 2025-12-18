import { APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getPool } from "../lib/db";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

export const handler: APIGatewayProxyHandlerV2 = async (event): Promise<APIGatewayProxyStructuredResultV2> => {
  const LIMIT = 20;
  const page = event.pathParameters?.page;
  
  if (!page || isNaN(Number(page)) || Number(page) < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request', message: 'Missing page parameter' }),
    };
  }
  
  const offset = (Number(page) - 1) * LIMIT;
  const query = `
    SELECT
      p.id,
      p.body,
      p.author,
      per.username AS author_username,
      p.created_at,
      COUNT(DISTINCT l.id) AS likes_count,
      COUNT(DISTINCT c.id) AS comments_count
    FROM posts p
    LEFT JOIN personas per ON p.author = per.persona_id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, p.body, p.author, per.username, p.created_at
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  
  try {
    const pool = await getPool();
    const result = await pool.query(query, [LIMIT, offset]);
    return {
      statusCode: 200,
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
      body: JSON.stringify({ error: 'Internal Server Error', message: message }),
    };
  }
};
