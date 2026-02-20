import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

let ssmClient: SSMClient | undefined;

export const getSSMClient = () => {
  if (!ssmClient) {
    ssmClient = new SSMClient({});
  }
  
  return ssmClient;
}