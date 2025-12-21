import { getPool } from "../lib/db";
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
  const relation = event.queryStringParameters?.relation as Relation;

  if (!personaId || isNaN(Number(personaId)) || Number(personaId) < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Bad Request', message: 'Invalid persona_id parameter'}),
    };
  }
  
  if (!relation || !relations[relation]) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Bad Request', message: 'Invalid relation parameter'}),
    };
  }
  
  const targetColumn = relation === 'follower' ? 'followed' : 'follower';
  const query = `
    SELECT p.persona_id, p.username
    FROM follows f
    JOIN personas p ON p.persona_id = f.${targetColumn}
    WHERE f.${relation} = $1
  `;
  
  try {
    const pool = await getPool();
    const result = await pool.query(query, [personaId]);

    const personas = result.rows;

    return {
      statusCode: 200,
      body: JSON.stringify(personas),
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
