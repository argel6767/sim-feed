import os
import subprocess
from pathlib import Path
from winreg import LoadKey
from deploy_api import is_os_windows

scheduler_engine_directory = Path.cwd() / "scheduler-engine"

def check_if_docker_is_running():
    try:
        subprocess.run(["docker", "ps"], stdout=subprocess.PIPE, text=True, check=True)
    except subprocess.CalledProcessError:
        raise Exception("Docker is not running")

def load_env_vars():
    env_file = Path.cwd() / "aws.env"
    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                if line.startswith("#"):
                    continue
                key, value = line.strip().split("=")
                os.environ[key] = value
    print("Environment variables loaded\n")
    
def sign_in_to_ecr():
    print("Signing in to ECR\n")
    get_login_commands = ["aws", "ecr", "get-login-password", "--region", os.environ.get("AWS_REGION")]
    process = subprocess.run(get_login_commands, stdout=subprocess.PIPE, text=True)
    if process.returncode != 0:
        raise Exception("Failed to sign in to ECR")
    
    
    docker_login_commands = ["docker", "login", "--username", "AWS", "--password-stdin", os.environ.get("AWS_ACCOUNT_ID")]
    process = subprocess.run(docker_login_commands, input=process.stdout, text=True)
    print(process)
    if process.returncode != 0:
        raise Exception("Failed to login to Docker")

def build_scheduler_engine_image():
    print("Building scheduler engine image\n")
    commands = ["docker", "build", "-t", "scheduler-engine", "."]
    process = subprocess.run(commands, cwd=scheduler_engine_directory, shell=is_os_windows)
    print(process)
    if process.returncode != 0:
        raise Exception("Failed to build scheduler engine image")

def tag_scheduler_engine_image():
    print("Tagging scheduler engine image\n")
    repo = os.environ.get("AWS_REPO")
    commands = ["docker", "tag", "scheduler-engine:latest", repo]
    process = subprocess.run(commands, cwd=scheduler_engine_directory, shell=is_os_windows)
    print(process)
    if process.returncode != 0:
        raise Exception("Failed to tag scheduler engine image")

def push_scheduler_engine_image():
    print("Pushing scheduler engine image\n")
    repo = os.environ.get("AWS_REPO")
    commands = ["docker", "push", repo]
    process = subprocess.run(commands, cwd=scheduler_engine_directory, shell=is_os_windows)
    print(process)
    if process.returncode != 0:
        raise Exception("Failed to push scheduler engine image")

def restart_scheduler_engine():
    print("Restarting scheduler engine\n")
    commands = ["aws", "ssm", "send-command", "--document-name", "AWS-RunShellScript", "--parameters", "commands=['sudo systemctl restart scheduler-engine']", "--instance-ids", os.environ.get("EC2_INSTANCE_ID")]
    process = subprocess.run(commands, cwd=scheduler_engine_directory, shell=is_os_windows)
    if process.returncode != 0:
        raise Exception("Failed to restart scheduler engine")

def main():
    check_if_docker_is_running()
    load_env_vars()
    sign_in_to_ecr()
    build_scheduler_engine_image()
    tag_scheduler_engine_image()
    push_scheduler_engine_image()
    restart_scheduler_engine()
    print("Scheduler Engine image deployed successfully")
    
if __name__ == "__main__":
    main()
