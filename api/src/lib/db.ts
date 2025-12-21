import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { Pool } from "pg";

let pool: Pool | undefined;

export const getPool = async (): Promise<Pool> => {
  if (pool) return pool;
  const useSSL = process.env.USE_SSL === "true";
  
  let connectionString;

  if (useSSL) {
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
    connectionString = param.Parameter.Value;
  }
  else {
    connectionString = process.env.DATABASE_URL;
  }

 
  console.log("Database URL fetched, creating pool...");

  pool = new Pool({
    connectionString: connectionString,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });
  
  console.log("Pool created successfully");

  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = undefined;
    console.log("Pool closed");
  }
};