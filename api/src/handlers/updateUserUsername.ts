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
    signingSecret = process.env.SIGNING_SECRET_UPDATE;
  } else {
    const ssm = getSSMClient();
    const param = await ssm.send(
      new GetParameterCommand({
        Name: "/sim-feed/signing-secret/update",
        WithDecryption: true,
      }),
    );

    if (!param.Parameter?.Value) {
      throw new Error("SIGNING_SECRET_UPDATE not found in SSM");
    }

    signingSecret = param.Parameter.Value;
  }

  const query = `
    UPDATE users
    SET username = $2, updated_at = NOW()
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
    const { id, username } = data;

    if (!id || !username || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    if (type !== "user.updated") {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Event ignored" }),
      };
    }

    const pool = await getPool();
    const result = await pool.query(query, [id, username]);

    if (result.rowCount === 0) {
      console.log("User not found, creating new user entry");
      const insertQuery = `
        INSERT INTO users (id, username, bio, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *;
      `;
      const insertResult = await pool.query(insertQuery, [id, username, ""]);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "User created",
          user: insertResult.rows[0],
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Username updated",
        user: result.rows[0],
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
