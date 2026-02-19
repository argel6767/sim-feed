import { getPool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getSSMClient } from "../lib/ssm";
import { GetParameterCommand } from "@aws-sdk/client-ssm";
import { Webhook } from "svix";
import { getDomain } from "../lib/domain";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.ALLOWED_ORIGIN || getDomain(),
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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

  if (!event.body) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing request body" }),
    };
  }

  const useSSL = process.env.USE_SSL === "true";
  let signingSecret;

  if (!useSSL) {
    signingSecret = process.env.SIGNING_SECRET_DELETE;
  } else {
    const ssm = getSSMClient();
    const param = await ssm.send(
      new GetParameterCommand({
        Name: "/sim-feed/signing-secret/delete",
        WithDecryption: true,
      }),
    );

    if (!param.Parameter?.Value) {
      throw new Error("SIGNING_SECRET_DELETE not found in SSM");
    }

    signingSecret = param.Parameter.Value;
  }

  const query = `
    DELETE FROM users
    WHERE id = $1
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
    const { id } = data;

    if (!id || !type) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    if (type !== "user.deleted") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Event ignored" }),
      };
    }

    const pool = await getPool();
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "User deleted", user: result.rows[0] }),
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
