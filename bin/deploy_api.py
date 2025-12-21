import os
import subprocess
from pathlib import Path
import platform

api_directory = Path.cwd()/ "api"
is_os_windows = platform.system() == "Windows"

def load_env_variable():
    env_file = api_directory / ".env"
    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                if line.startswith("#") or not line.strip():
                    continue
                key, value = line.strip().split("=")
                os.environ[key] = value
    else:
        raise FileNotFoundError(f"Environment file not found at {env_file}")
        
def deploy_api():
    process = subprocess.run(["pnpm", "run", "deploy"], cwd=api_directory, shell=is_os_windows)
    print(process)
    
    if process.returncode != 0:
        raise Exception(f"Deployment failed with exit code {process.returncode}")
        
    print("Deployment successful")
    
def main():
    load_env_variable()
    deploy_api()
    
if __name__ == "__main__":
    main()