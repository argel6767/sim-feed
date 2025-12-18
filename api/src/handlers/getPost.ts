import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getPool } from "../lib/db";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const post_id = event.pathParameters?.post_id;
  
  if (!post_id || isNaN(Number(post_id)) || Number(post_id) < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid post ID' })
    };
  }
  
  const query = `
    SELECT
      p.id,
      p.body,
      p.author,
      per.username AS author_username,
      p.created_at,
      COUNT(DISTINCT l.id) AS likes_count,
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
    LEFT JOIN likes l ON p.id = l.post_id
    WHERE p.id = $1
    GROUP BY p.id, p.body, p.author, per.username, p.created_at
   `;
  
  try {
    const pool = await getPool();
    const result = await pool.query(query, [post_id]);
    if (!result.rows || result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Post ID ${post_id} not found` })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: message }),
    };
  }
}