from pathlib import Path
import sys

# Define paths
BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

def parse_retailers():
    print("⏳ Loading retailers from retailers.txt")
    retailers = []
    try:
        with open(ORIGINAL_DATA / 'retailers.txt', 'r') as f:
            lines = [line.strip() for line in f if '=' in line]
        
        if not lines:
            print("🔴 Error: No retailer entries found in retailers.txt")
            sys.exit(1)
            
        for idx, line in enumerate(lines, start=1):
            try:
                # Split by equals sign
                parts = line.split('=')
                if len(parts) != 2:
                    print(f"🔴 Error: Invalid format in line: {line}")
                    continue
                    
                name = parts[0].strip()
                url = parts[1].strip()
                retailers.append((idx, name, url))
            except Exception as e:
                print(f"🔴 Error: Failed to parse retailer line: {line}, {str(e)}")
                continue
                
        print(f"✅ Found {len(retailers)} retailers")
        return retailers
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'retailers.txt'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to parse retailers: {str(e)}")
        sys.exit(1)

def create_retailer_sql(retailers):
    print("🔧 Creating SQL for retailers")
    try:
        # Create SQL insert statement
        output_lines = ["INSERT INTO `Retailer` (`id`, `name`, `web_page_url`) VALUES"]
        
        for idx, name, url in retailers:
            # Format the values for SQL insert
            output_lines.append(f"({idx}, '{name}', '{url}'),")
        
        # Replace the last comma with a semicolon
        output_lines[-1] = output_lines[-1].replace("),", ");")
        
        return "\n".join(output_lines)
    except Exception as e:
        print(f"🔴 Error: Failed to create SQL: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Starting retailer processing")
    try:
        retailers = parse_retailers()
        sql_output = create_retailer_sql(retailers)
        
        # Ensure output directory exists
        MANIPULATED_DATA.mkdir(exist_ok=True)
        
        # Write to new file
        output_path = MANIPULATED_DATA / 'retailers.sql'
        with open(output_path, 'w') as f:
            f.write(sql_output)
        
        print(f"\n🎉 Successfully generated {output_path} with {len(retailers)} retailers\n")
    except Exception as e:
        print(f"🔴 Error: Retailer processing failed: {str(e)}")
        sys.exit(1)