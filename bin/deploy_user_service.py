import os
import subprocess
from pathlib import Path
import platform

from deploy_scheduler_engine import check_if_docker_is_running, load_env_vars, sign_in_to_ecr

user_service_directory = Path.cwd() / "user-service"
is_os_windows = platform.system() == "Windows"
repo_name = "/user-service-repo"

def build_user_service_image():
    print("Building user service image\n")
    commands = ["docker", "build", "-t", "user-service", "."]
    process = subprocess.run(commands, cwd=user_service_directory, shell=is_os_windows)
    if process.returncode != 0:
        raise Exception("Failed to build user service image")

def tag_user_service_image():
    print("Tagging user service image\n")
    aws_repo_root = os.environ["AWS_REPO"]
    repo = aws_repo_root + repo_name
    commands = ["docker", "tag", "user-service:latest", repo]
    process = subprocess.run(commands, cwd=user_service_directory, shell=is_os_windows)
    print(process)
    if process.returncode != 0:
        raise Exception("Failed to tag user service image")

def push_user_service_image():
    print("Pushing user service image\n")
    aws_repo_root = os.environ["AWS_REPO"]
    repo = aws_repo_root + repo_name
    commands = ["docker", "push", repo]
    process = subprocess.run(commands, cwd=user_service_directory, shell=is_os_windows)
    print(process)
    if process.returncode != 0:
        raise Exception("Failed to push user service image")

def restart_user_service():
    print("Restarting user service\n")
    send_cmd = [
        "aws", "ssm", "send-command",
        "--document-name", "AWS-RunShellScript",
        "--parameters", "commands=['sudo systemctl restart user-service']",
        "--instance-ids", os.environ.get("USER_SERVICE_EC2_INSTANCE_ID"),
        "--region", os.environ.get("AWS_REGION"),
        "--output", "json"
    ]
    process = subprocess.run(send_cmd, shell=is_os_windows)
    
    if process.returncode != 0:
        raise Exception(f"SSM send-command failed: {process.stderr}")

def main():
    env = os.environ.get("DEPLOY", "local")
    if env == "local":
        check_if_docker_is_running()
        load_env_vars()
        
    sign_in_to_ecr()
    build_user_service_image()
    tag_user_service_image()
    push_user_service_image()
    restart_user_service()
    print("User service deployed successfully!")

if __name__ == "__main__":
    main()