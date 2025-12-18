import { APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getPool } from "../lib/db";

export const config = {
  callbackWaitsForEmptyEventLoop: false
};

export const handler: APIGatewayProxyHandlerV2 = async (event): Promise<APIGatewayProxyStructuredResultV2> => {
  const numPosts = event.pathParameters?.num_posts;
  
  if (!numPosts || isNaN(Number(numPosts)) || Number(numPosts) < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid number of posts requested" }),
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
      COUNT(DISTINCT c.id) AS comments_count
    FROM posts p
    LEFT JOIN personas per ON p.author = per.persona_id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.id >= (SELECT (RANDOM() * MAX(id))::bigint FROM posts)
    GROUP BY p.id, p.body, p.author, per.username, p.created_at
    LIMIT $1
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, [numPosts]);
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
