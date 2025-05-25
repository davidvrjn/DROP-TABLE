from pathlib import Path
import json
import re
import sys

BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

def load_brands():
    print("⏳ Loading brands from brands.sql")
    brands = {}
    try:
        with open(ORIGINAL_DATA / 'products_with_text_brand.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("('")]
        
        if not lines:
            print("🔴 Error: No brand entries found in products_with_text_brand.sql")
            sys.exit(1)
            
        for idx, line in enumerate(lines, start=1):
            try:
                name = line.split("'")[1]  
                brands[idx] = name
            except IndexError:
                print(f"🔴 Error: Invalid format in line: {line}")
                brands[idx] = None
                
        print(f"✅ Found {len(brands)} brands")
        return brands
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'products_with_text_brand.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load brands: {str(e)}")
        sys.exit(1)

def load_categories():
    print("⏳ Loading categories from categories.sql")
    categories = {}
    try:
        with open(ORIGINAL_DATA / 'products_with_text_category.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("('")]
        
        if not lines:
            print("🔴 Error: No category entries found in products_with_text_category.sql")
            sys.exit(1)
            
        for idx, line in enumerate(lines, start=1):
            try:
                name = line.split("'")[1]
                categories[idx] = name
            except IndexError:
                print(f"🔴 Error: Invalid format in line: {line}")
                categories[idx] = None
                
        print(f"✅ Found {len(categories)} categories")
        return categories
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'products_with_text_category.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load categories: {str(e)}")
        sys.exit(1)

def load_dimensions():
    print("⏳ Loading dimensions from dimensions.sql")
    dimensions = {}
    try:
        with open(ORIGINAL_DATA / 'dimensions.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("('") or line.strip().startswith("(NULL")]
        
        if not lines:
            print("🔴 Error: No dimension entries found in dimensions.sql")
            sys.exit(1)
            
        for idx, line in enumerate(lines, start=1):
            if 'NULL' in line:
                dimensions[idx] = None
            else:
                # Extract dimension text between quotes
                match = re.search(r"\('([^']+)'\)", line)
                if match:
                    dimensions[idx] = match.group(1)
                else:
                    print(f"🔴 Error: Invalid format in line: {line}")
                    dimensions[idx] = None
                    
        print(f"✅ Found {len(dimensions)} dimension entries")
        return dimensions
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'dimensions.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load dimensions: {str(e)}")
        sys.exit(1)

def create_specifications():
    print("🔧 Creating product specifications JSON")
    try:
        brands = load_brands()
        categories = load_categories()
        dimensions = load_dimensions()
        
        # Ensure we have the same number of products in each dataset
        product_count = min(len(brands), len(categories), len(dimensions))
        if product_count == 0:
            print("🔴 Error: No products found in one or more datasets")
            sys.exit(1)
            
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
            try:
                json_spec = json.dumps(spec, ensure_ascii=False).replace("'", "\\'")  # Escape single quotes
                output_lines.append(f"('{json_spec}'),")
            except Exception as e:
                print(f"🔴 Error: Failed to convert specification to JSON: {str(e)}")
                output_lines.append("(NULL),")
        
        # Fix the last line to end with semicolon instead of comma
        output_lines[-1] = output_lines[-1].replace("),", ");")
        
        return "\n".join(output_lines)
    except Exception as e:
        print(f"🔴 Error: Failed to create specifications: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Starting specifications generation")
    try:
        MANIPULATED_DATA.mkdir(exist_ok=True)
        
        sql_output = create_specifications()
        output_path = MANIPULATED_DATA / 'products_with_specifications.sql'
        
        with open(output_path, 'w') as f:
            f.write(sql_output)
        
        print(f"\n🎉 Successfully generated {output_path}\n")
    except Exception as e:
        print(f"🔴 Error: Specifications generation failed: {str(e)}")
        sys.exit(1)