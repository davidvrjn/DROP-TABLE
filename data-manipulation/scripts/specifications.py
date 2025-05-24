from pathlib import Path
import json
import re

BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

def load_brands():
    print("⏳ Loading brands from brands.sql")
    brands = {}
    with open(ORIGINAL_DATA / 'products_with_text_brand.sql', 'r') as f:
        lines = [line.strip() for line in f if line.strip().startswith("('")]
    
    for idx, line in enumerate(lines, start=1):
        name = line.split("'")[1]  
        brands[idx] = name
    print(f"✅ Found {len(brands)} brands")
    return brands

def load_categories():
    print("⏳ Loading categories from categories.sql")
    categories = {}
    with open(ORIGINAL_DATA / 'products_with_text_category.sql', 'r') as f:
        lines = [line.strip() for line in f if line.strip().startswith("('")]
    
    for idx, line in enumerate(lines, start=1):
        name = line.split("'")[1]
        categories[idx] = name
    print(f"✅ Found {len(categories)} categories")
    return categories

def load_dimensions():
    print("⏳ Loading dimensions from dimensions.sql")
    dimensions = {}
    with open(ORIGINAL_DATA / 'dimensions.sql', 'r') as f:
        lines = [line.strip() for line in f if line.strip().startswith("('") or line.strip().startswith("(NULL")]
    
    for idx, line in enumerate(lines, start=1):
        if 'NULL' in line:
            dimensions[idx] = None
        else:
            # Extract dimension text between quotes
            match = re.search(r"\('([^']+)'\)", line)
            if match:
                dimensions[idx] = match.group(1)
            else:
                dimensions[idx] = None
    print(f"✅ Found {len(dimensions)} dimension entries")
    return dimensions

def create_specifications():
    print("🔧 Creating product specifications JSON")
    brands = load_brands()
    categories = load_categories()
    dimensions = load_dimensions()
    
    # Ensure we have the same number of products in each dataset
    product_count = min(len(brands), len(categories), len(dimensions))
    print(f"ℹ️ Processing {product_count} products")
    
    specifications = []
    for i in range(1, product_count + 1):
        spec = {
            "brand": brands.get(i),
            "category": categories.get(i),
            "dimensions": dimensions.get(i)
        }
        specifications.append(spec)
    
    # Create SQL insert statement with JSON specifications
    output_lines = ["INSERT INTO `Products` (`specifications`) VALUES"]
    for spec in specifications:
        json_spec = json.dumps(spec, ensure_ascii=False).replace("'", "\\'")  # Escape single quotes
        output_lines.append(f"('{json_spec}'),")
    
    # Fix the last line to end with semicolon instead of comma
    output_lines[-1] = output_lines[-1].replace("),", ");")
    
    return "\n".join(output_lines)

if __name__ == '__main__':
    print("🚀 Starting specifications generation")
    MANIPULATED_DATA.mkdir(exist_ok=True)
    
    sql_output = create_specifications()
    output_path = MANIPULATED_DATA / 'products_with_specifications.sql'
    
    with open(output_path, 'w') as f:
        f.write(sql_output)
    
    print(f"\n🎉 Successfully generated {output_path}\n")