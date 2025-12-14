import { pool } from "../lib/db";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const config = {
  callbackWaitsForEmptyEventLoop: false,
};

const relations = Object.freeze({
  follower: 'follower',
  followed: 'followed'
})

type Relation = 'follower' | 'followed';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const personaId = event.pathParameters?.persona_id;
  const relation = event.pathParameters?.relation as Relation;

  if (!personaId) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Bad Request', message: 'Missing persona_id parameter'}),
    };
  }
  
  if (!relation || !relations[relation]) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Bad Request', message: 'Missing relation parameter'}),
    };
  }

  try {
    const result = await pool.query(`SELECT * FROM follows WHERE ${relation} = $1`, [personaId]);

    if (!result.rows.length || result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({error: 'Not Found', message: `No ${relation} relations found for persona with ID ${personaId}`}),
      };
    }

    const persona = result.rows[0];

    return {
      statusCode: 200,
      body: JSON.stringify(persona),
    };
  } catch (error) {
    console.error(error);
    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Internal Server Error', message: message}),
    };
  }
};
