import { getPool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "https://sim-feed.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }
  
  const query = `
    SELECT
      p.persona_id,
      p.bio,
      p.username,
      COALESCE(following_count.count, 0) AS following_count,
      COALESCE(followers_count.count, 0) AS followers_count
    FROM personas p
    LEFT JOIN (
      SELECT follower, COUNT(*) as count
      FROM follows
      GROUP BY follower
    ) following_count ON p.persona_id = following_count.follower
    LEFT JOIN (
      SELECT followed, COUNT(*) as count
      FROM follows
      GROUP BY followed
    ) followers_count ON p.persona_id = followers_count.followed
    ORDER BY p.persona_id`;
  
  try {
    const pool = await getPool();
    const result = await pool.query(query);
    const personas = result.rows;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(personas),
    };
    
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
