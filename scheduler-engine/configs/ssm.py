import boto3
from botocore.config import Config
import os



config = Config(
    region_name='us-east-2',
    retries={
        'max_attempts': 10,
        'mode': 'standard'
    },
)

def get_ssm_parameters():
    ssm = boto3.client('ssm', config=config, aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"), aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"))
    try:
        db_url = ssm.get_parameter(Name="/copilot/scheduler-engine-app/production/secrets/DATABASE_URL", WithDecryption=True)["Parameter"]["Value"]
        deepseek_api_key = ssm.get_parameter(Name="/copilot/scheduler-engine-app/production/secrets/DEEPSEEK_API_KEY", WithDecryption=True)["Parameter"]["Value"]
        secret_key = ssm.get_parameter(Name="/copilot/scheduler-engine-app/production/secrets/SECRET-KEY", WithDecryption=True)["Parameter"]["Value"]
        bootstrap_token = ssm.get_parameter(Name="/copilot/scheduler-engine-app/production/secrets/BOOTSTRAP_TOKEN", WithDecryption=True)["Parameter"]["Value"]
        os.environ["DATABASE_URL"] = db_url
        os.environ["DEEPSEEK_API_KEY"] = deepseek_api_key
        os.environ["SECRET_KEY"] = secret_key
        os.environ["BOOTSTRAP_TOKEN"] = bootstrap_token
    except Exception as e:
        print(f"Error fetching SSM parameters: {e}")
        raise
