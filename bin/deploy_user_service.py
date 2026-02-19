import os
import subprocess
from pathlib import Path
import platform

from deploy_scheduler_engine import check_if_docker_is_running, load_env_vars, sign_in_to_ecr

user_service_directory = Path.cwd() / "user-service"
is_windows = platform.system() == "Windows"

def build_user_service_image():
    print("Building user service image\n")