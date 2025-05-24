import os
from pathlib import Path

# Define relative paths
BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

# Create mapping from brands.sql
def parse_brands():
    brands = {}
    with open(ORIGINAL_DATA / 'brands.sql', 'r') as f:
        lines = [line.strip() for line in f if line.strip().startswith("('")]
    for idx, line in enumerate(lines, start=1):
        name = line.split("'")[1]
        brands[name] = idx
    return brands

def process_products(brand_map):
    with open(ORIGINAL_DATA / 'products_with_text_brand.sql', 'r') as f:
        content = f.read()
    
    # Split into individual INSERT lines
    insert_lines = [line.strip() for line in content.split('\n') 
                   if line.strip().startswith("('")]
    
    # Replace brand names with IDs
    updated_lines = []
    for line in insert_lines:
        brand_name = line.split("'")[1]
        brand_id = brand_map.get(brand_name, 'NULL')
        updated_lines.append(f"({brand_id}),")
    
    # Build new SQL content
    return 'INSERT INTO `Products` (`brand_id`) VALUES\n' + '\n'.join(updated_lines)

if __name__ == '__main__':
    brand_map = parse_brands()
    new_sql = process_products(brand_map)
    
    # Ensure output directory exists
    MANIPULATED_DATA.mkdir(exist_ok=True)
    
    # Write to new file
    output_path = MANIPULATED_DATA / 'products_with_brand_ids.sql'
    with open(output_path, 'w') as f:
        f.write(new_sql)
    
    print(f'Generated {output_path} with {len(brand_map)} brand mappings')