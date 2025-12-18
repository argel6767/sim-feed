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
  
  const query = "SELECT * FROM your_table WHERE id >= (SELECT (RANDOM() * MAX(id))::bigint FROM your_table) LIMIT $1;";

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
