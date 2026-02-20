import { getPool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getSSMClient } from "../lib/ssm";
import { GetParameterCommand } from "@aws-sdk/client-ssm";
import { Webhook } from "svix";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      body: "",
    };
  }
  
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing request body" }),
    };
  }
  
  const useSSL = process.env.USE_SSL === "true";
  let signingSecret;
  
  if (!useSSL) {
    signingSecret = process.env.SIGNING_SECRET_INSERT;
  }
  else {
    const ssm = getSSMClient();
    const param = await ssm.send(
      new GetParameterCommand({
        Name: "/sim-feed/signing-secret/insert",
        WithDecryption: true
      })
    );
    
    if (!param.Parameter?.Value) {
      throw new Error("SIGNING_SECRET_INSERT not found in SSM");
    }
    
    signingSecret = param.Parameter.Value;
  }
  
  const query = `
    INSERT INTO users (id, username, bio, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *;
  `;
  
  try {
    const wh = new Webhook(signingSecret!!);
        const headers = {
          "svix-id": event.headers["svix-id"] || "",
          "svix-timestamp": event.headers["svix-timestamp"] || "",
          "svix-signature": event.headers["svix-signature"] || "",
        };
    
    wh.verify(event.body, headers);
    console.log("Clerk Webhook Verified");
    const { data, type } = JSON.parse(event.body);
    const { id, username } = data;
    
    if (!id || !username || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }
    
    if (type !== "user.created") {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Event ignored" }),
          };
        }
    const pool = await getPool();
    const result = await pool.query(query, [id, username, ""]);
    return {
      statusCode: 201,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}