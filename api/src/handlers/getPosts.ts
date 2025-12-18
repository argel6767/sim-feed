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
  const query = `SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
  
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
