import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { Pool } from "pg";

let pool: Pool | undefined;

export const getPool = async (): Promise<Pool> => {
  if (pool) return pool;
  const useSSL = process.env.USE_SSL === "true";

  const ssm = new SSMClient({});
  const param = await ssm.send(
    new GetParameterCommand({
      Name: "/sim-feed/database-url",
      WithDecryption: true
    })
  );

  if (!param.Parameter?.Value) {
    throw new Error("DATABASE_URL not found in SSM");
  }
  
  console.log("Database URL fetched, creating pool...");

  pool = new Pool({
    connectionString: param.Parameter.Value,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });

  return pool;
};