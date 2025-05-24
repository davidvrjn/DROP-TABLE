import os
import subprocess
import sys

# Define the subfolder where your scripts are located
SCRIPTS_FOLDER = "scripts"

def run_python_script(script_path):
    print(f"\n🔵 Executing: {script_path}")
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            text=True
        )
        print(f"🟢 Success: {script_path}")
    except subprocess.CalledProcessError as e:
        print(f"🔴 Error: {script_path} (FAILED)")
        print(f"Error Code: {e.returncode}")
        print("STDOUT:")
        print(e.stdout)
        print("STDERR:")
        print(e.stderr)
    except FileNotFoundError:
        print(f"🔴 Error: Python interpreter not found at {sys.executable}. Make sure Python is correctly installed.")
    except Exception as e:
        print(f"🔴 Error: An unexpected error occurred while trying to run {script_path}: {e}")

def run_all_scripts_in_folder(folder_path):
    """
    Discovers all Python files (.py) in the specified folder and runs them.
    Excludes files starting with '__' (like __init__.py).
    """
    if not os.path.isdir(folder_path):
        print(f"🔴 Error: Folder '{folder_path}' not found.")
        return

    print("\n")
    print(f"Scanning for Python scripts in: {folder_path}")
    scripts_found = []

    for item_name in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item_name)
        if os.path.isfile(item_path) and item_name.endswith(".py") and not item_name.startswith('__'):
            scripts_found.append(item_path)

    if not scripts_found:
        print(f"🔴 Error: No Python scripts found in '{folder_path}'.")
        return

    # Sort scripts to ensure consistent execution order (optional, but good practice)
    scripts_found.sort()

    print(f"Found {len(scripts_found)} scripts to run.")
    for script in scripts_found:
        run_python_script(script)
    print("\n--- All scripts execution complete ---")

if __name__ == "__main__":
    # Get the absolute path to the scripts folder
    # This makes the script runnable from any directory if main_runner.py is accessed
    # and the relative path to 'scripts' is correct.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    full_scripts_folder_path = os.path.join(current_dir, SCRIPTS_FOLDER)

    run_all_scripts_in_folder(full_scripts_folder_path)