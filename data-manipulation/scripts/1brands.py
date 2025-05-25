import os
from pathlib import Path
import sys

# Define relative paths
BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

# Create mapping from brands.sql
def parse_brands():
    print("⏳ Parsing brands from brands.sql...")
    brands = {}
    try:
        with open(ORIGINAL_DATA / 'brands.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("('")]
        
        if not lines:
            print("🔴 Error: No brand entries found in brands.sql")
            sys.exit(1)
            
        for idx, line in enumerate(lines, start=1):
            try:
                name = line.split("'")[1]
                # Store brand name in lowercase for case-insensitive matching
                brands[name.lower()] = idx
            except IndexError:
                print(f"🔴 Error: Invalid format in line: {line}")
                continue
                
        print(f"✅ Found {len(brands)} brand mappings")
        return brands
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'brands.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to parse brands: {str(e)}")
        sys.exit(1)

def process_products(brand_map):
    print(f"🔧 Processing {len(brand_map)} brands in products_with_text_brand.sql")
    try:
        with open(ORIGINAL_DATA / 'products_with_text_brand.sql', 'r') as f:
            content = f.read()
        
        # Split into individual INSERT lines
        insert_lines = [line.strip() for line in content.split('\n') 
                       if line.strip().startswith("('")]
        
        if not insert_lines:
            print("🔴 Error: No product entries found in products_with_text_brand.sql")
            sys.exit(1)
            
        # Replace brand names with IDs
        updated_lines = []
        for line in insert_lines:
            try:
                brand_name = line.split("'")[1]
                # Convert to lowercase for case-insensitive lookup
                brand_id = brand_map.get(brand_name.lower(), 'NULL')
                updated_lines.append(f"({brand_id}),")
            except IndexError:
                print(f"🔴 Error: Invalid format in line: {line}")
                updated_lines.append("(NULL),")
        
        # Build new SQL content
        return 'INSERT INTO `Products` (`brand_id`) VALUES\n' + '\n'.join(updated_lines)
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'products_with_text_brand.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to process products: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Starting brand ID conversion")
    try:
        brand_map = parse_brands()
        new_sql = process_products(brand_map)
        
        # Ensure output directory exists
        MANIPULATED_DATA.mkdir(exist_ok=True)
        
        # Write to new file
        output_path = MANIPULATED_DATA / 'products_with_brand_ids.sql'
        with open(output_path, 'w') as f:
            f.write(new_sql)
        
        print(f"\n🎉 Successfully generated {output_path} with {len(brand_map)} brand mappings\n")
    except Exception as e:
        print(f"🔴 Error: Brand conversion failed: {str(e)}")
        sys.exit(1)