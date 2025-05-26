import os
import subprocess
import sys
import shutil
from pathlib import Path

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

def copyfiles():
    # Create Final Statements directory
    final_dir = Path(__file__).parent / 'Final Statements'
    final_dir.mkdir(exist_ok=True)
    
    # Copy required files
    files_to_copy = [
        ('original-data', 'brands.sql'),
        ('original-data', 'categories.sql'),
        ('original-data', 'users.sql'),
        ('manipulated-data', 'retailers.sql'),
        ('manipulated-data', 'product_retailers.sql'),
        ('manipulated-data', 'merged_products.sql', 'products.sql'),
        ('manipulated-data','reviews.sql')
    ]
    
    for entry in files_to_copy:
        if len(entry) == 3:
            folder, src_name, dest_name = entry
        else:
            folder, src_name = entry
            dest_name = src_name
        
        src = Path(__file__).parent / folder / src_name
        dest = final_dir / dest_name
        try:
            shutil.copy2(src, dest)
            print(f"✅ Copied {src_name} to Final Statements")
        except Exception as e:
            print(f"🔴 Failed to copy {dest_name}: {str(e)}")
    
    # After all copies are done
    try:
        manipulated_dir = Path(__file__).parent / 'manipulated-data'
        shutil.rmtree(manipulated_dir)
        print(f"✅ Cleaned up {manipulated_dir}")
    except Exception as e:
        print(f"🔴 Failed to clean up {manipulated_dir}: {str(e)}")
    
    print("\n🎉 All operations completed successfully!")

def createSQL():
    print("\n🔵 Creating final SQL file...")
    
    # Define paths
    current_dir = Path(__file__).parent
    schema_file = current_dir / 'db-schema' / 'DROP-TABLE.sql'
    final_statements_dir = current_dir / 'Final Statements'
    output_file = current_dir / 'DROP-TABLE-COMPLETE.sql'
    
    # Define the order of data files to maintain referential integrity
    # Order matters: tables with foreign keys should come after their referenced tables
    data_files_order = [
        'brands.sql',        # No foreign keys
        'categories.sql',    # No foreign keys
        'users.sql',         # No foreign keys
        'retailers.sql',     # No foreign keys
        'products.sql',      # References brands and categories
        'product_retailers.sql', # References products and retailers
        'reviews.sql'        # References users and products
    ]
    
    try:
        # Start with the schema
        with open(schema_file, 'r') as f:
            schema_content = f.read()
        
        # Create the output file with schema
        with open(output_file, 'w') as out_f:
            out_f.write(schema_content)
            
            # Add a separator and comment
            out_f.write("\n\n-- --------------------------------------------------------\n")
            out_f.write("-- Data Import\n")
            out_f.write("-- --------------------------------------------------------\n\n")
            
            # Append each data file in the specified order
            for data_file in data_files_order:
                data_file_path = final_statements_dir / data_file
                
                if data_file_path.exists():
                    print(f"✅ Adding data from {data_file}")
                    with open(data_file_path, 'r') as f:
                        data_content = f.read()
                    
                    # Add a comment indicating which data file is being added
                    out_f.write(f"-- Data from {data_file}\n")
                    out_f.write(data_content)
                    out_f.write("\n\n")
                else:
                    print(f"🔴 Warning: {data_file} not found in Final Statements directory")
        
        print(f"✅ Complete SQL file created at {output_file}")
        print("\n🎉 Database creation file is ready for import!")
        
        # Delete the Final Statements directory after successful SQL file creation
        try:
            if final_statements_dir.exists():
                shutil.rmtree(final_statements_dir)
                print(f"✅ Cleaned up {final_statements_dir}")
        except Exception as e:
            print(f"🔴 Failed to delete Final Statements directory: {str(e)}")
        
    except Exception as e:
        print(f"🔴 Error creating SQL file: {str(e)}")

if __name__ == "__main__":
    # Get the absolute path to the scripts folder
    # This makes the script runnable from any directory if main_runner.py is accessed
    # and the relative path to 'scripts' is correct.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    full_scripts_folder_path = os.path.join(current_dir, SCRIPTS_FOLDER)

    run_all_scripts_in_folder(full_scripts_folder_path)
    copyfiles()
    createSQL()