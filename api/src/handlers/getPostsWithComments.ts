import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getPool } from "../lib/db";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const LIMIT = 20;
  const page = event.pathParameters?.page;
  
  if (!page || isNaN(Number(page)) || Number(page) < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request', message: 'Invalid page parameter' }),
    };
  }
  
  const offset = (Number(page) -1) * LIMIT;
  const query = `
      SELECT
        p.id,
        p.title,
        p.body,
        p.author,
        per.username AS author_username,
        p.created_at,
        (SELECT COUNT(DISTINCT id) FROM likes WHERE post_id = p.id) AS likes_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'body', c.body,
              'author_id', c.author_id,
              'author_username', c_per.username,
              'created_at', c.created_at
            )
            ORDER BY c.created_at ASC
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS comments
      FROM posts p
      LEFT JOIN personas per ON p.author = per.persona_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN personas c_per ON c.author_id = c_per.persona_id
      GROUP BY p.id, p.title, p.body, p.author, per.username, p.created_at
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, [LIMIT, offset]);
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error("Failed to fetch posts with comments", error);
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
