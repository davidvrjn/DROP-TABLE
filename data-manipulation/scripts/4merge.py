from pathlib import Path
import re
import json
import sys

# Define paths
BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

def load_brand_ids():
    print("⏳ Loading brand IDs from products_with_brand_ids.sql")
    brand_ids = []
    try:
        with open(MANIPULATED_DATA / 'products_with_brand_ids.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("(")]
        
        if not lines:
            print("🔴 Error: No brand ID entries found in products_with_brand_ids.sql")
            sys.exit(1)
            
        for line in lines:
            # Extract ID from format like (123),
            brand_id = line.strip('(),').strip()
            brand_ids.append(brand_id)
        
        print(f"✅ Found {len(brand_ids)} brand IDs")
        return brand_ids
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {MANIPULATED_DATA / 'products_with_brand_ids.sql'}")
        print("Make sure to run brands.py first")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load brand IDs: {str(e)}")
        sys.exit(1)

def load_category_ids():
    print("⏳ Loading category IDs from products_with_category_ids.sql")
    category_ids = []
    try:
        with open(MANIPULATED_DATA / 'products_with_category_ids.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("(")]
        
        if not lines:
            print("🔴 Error: No category ID entries found in products_with_category_ids.sql")
            sys.exit(1)
            
        for line in lines:
            # Extract ID from format like (123),
            category_id = line.strip('(),').strip()
            category_ids.append(category_id)
        
        print(f"✅ Found {len(category_ids)} category IDs")
        return category_ids
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {MANIPULATED_DATA / 'products_with_category_ids.sql'}")
        print("Make sure to run categories.py first")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load category IDs: {str(e)}")
        sys.exit(1)

def load_specifications():
    print("⏳ Loading specifications from products_with_specifications.sql")
    specifications = []
    try:
        with open(MANIPULATED_DATA / 'products_with_specifications.sql', 'r') as f:
            lines = [line.strip() for line in f if line.strip().startswith("('")]
        
        if not lines:
            print("🔴 Error: No specification entries found in products_with_specifications.sql")
            sys.exit(1)
            
        for line in lines:
            # Extract JSON string between quotes
            match = re.search(r"\('(.+)'\)", line)
            if match:
                spec_json = match.group(1)
                specifications.append(spec_json)
            else:
                print(f"🔴 Error: Invalid format in line: {line}")
                specifications.append("NULL")
        
        print(f"✅ Found {len(specifications)} specification entries")
        return specifications
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {MANIPULATED_DATA / 'products_with_specifications.sql'}")
        print("Make sure to run specifications.py first")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load specifications: {str(e)}")
        sys.exit(1)

def load_bulk_data():
    print("⏳ Loading original product data from bulk.sql")
    products = []
    
    try:
        with open(ORIGINAL_DATA / 'bulk.sql', 'r') as f:
            # Skip the first line (INSERT INTO statement)
            try:
                next(f)
            except StopIteration:
                print("🔴 Error: bulk.sql file is empty")
                sys.exit(1)
            
            # Read all product lines
            content = f.read()
            # Split by product entries (each starting with a parenthesis)
            product_entries = re.findall(r"\('.*?'\),", content, re.DOTALL)
            
            if not product_entries:
                print("🔴 Error: No product entries found in bulk.sql")
                sys.exit(1)
            
        for entry in product_entries:
            # Extract the values between parentheses
            match = re.search(r"\((.+)\),", entry, re.DOTALL)
            if match:
                values = match.group(1)
                # Split by commas, but respect nested structures
                parts = []
                current = ""
                in_quotes = False
                in_array = 0
                
                for char in values:
                    if char == "'" and (len(current) == 0 or current[-1] != "\\"):
                        in_quotes = not in_quotes
                    elif char == "[" and not in_quotes:
                        in_array += 1
                    elif char == "]" and not in_quotes:
                        in_array -= 1
                    
                    if char == "," and not in_quotes and in_array == 0:
                        parts.append(current.strip())
                        current = ""
                    else:
                        current += char
                
                if current:
                    parts.append(current.strip())
                    
                # Extract the needed fields (title, description, created_at, updated_at, image_url, features, images)
                if len(parts) >= 7:
                    products.append({
                        'title': parts[0],
                        'description': parts[1],
                        'created_at': parts[2],
                        'updated_at': parts[3],
                        'image_url': parts[4],
                        'features': parts[5],
                        'images': parts[6]
                    })
                else:
                    print(f"🔴 Error: Insufficient fields in entry: {entry[:50]}...")
            else:
                print(f"🔴 Error: Invalid format in entry: {entry[:50]}...")
        
        if not products:
            print("🔴 Error: Failed to extract any valid products from bulk.sql")
            sys.exit(1)
            
        print(f"✅ Found {len(products)} products in bulk data")
        return products
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'bulk.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to load bulk data: {str(e)}")
        sys.exit(1)

def merge_data():
    print("🔄 Merging data from all sources")
    try:
        brand_ids = load_brand_ids()
        category_ids = load_category_ids()
        specifications = load_specifications()
        bulk_data = load_bulk_data()
        
        # Determine the number of products (use the minimum to avoid index errors)
        product_count = min(len(brand_ids), len(category_ids), len(specifications), len(bulk_data))
        if product_count == 0:
            print("🔴 Error: No products found in one or more datasets")
            sys.exit(1)
            
        print(f"ℹ️ Processing {product_count} products for merging")
        
        # Create merged SQL insert statement
        output_lines = ["INSERT INTO `Product` (`id`, `category_id`, `brand_id`, `title`, `description`, `created_at`, `updated_at`, `image_url`, `images`, `specifications`, `features`) VALUES"]
        
        for i in range(product_count):
            try:
                product = bulk_data[i]
                brand_id = brand_ids[i]
                category_id = category_ids[i]
                spec = specifications[i]
                
                # Format the values for SQL insert
                values = [
                    str(i + 1),  # id (1-indexed)
                    category_id,
                    brand_id,
                    product['title'],
                    product['description'],
                    product['created_at'],
                    product['updated_at'],
                    product['image_url'],
                    product['images'],
                    f"'{spec}'",  # specifications JSON
                    product['features']
                ]
                
                # Add to output
                if i < product_count - 1:
                    output_lines.append(f"({', '.join(values)}),")
                else:
                    output_lines.append(f"({', '.join(values)});")
            except Exception as e:
                print(f"🔴 Error processing product {i+1}: {str(e)}")
                # Skip this product and continue with the next one
                continue
        
        if len(output_lines) <= 1:
            print("🔴 Error: No products were successfully processed")
            sys.exit(1)
            
        return "\n".join(output_lines)
    except Exception as e:
        print(f"🔴 Error: Failed to merge data: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Starting data merge process")
    
    try:
        merged_sql = merge_data()
        
        # Ensure output directory exists
        MANIPULATED_DATA.mkdir(exist_ok=True)
        
        # Write to new file in manipulated-data directory instead of overwriting original
        output_path = MANIPULATED_DATA / 'merged_products.sql'
        with open(output_path, 'w') as f:
            f.write(merged_sql)
        
        print(f"\n🎉 Successfully generated merged SQL file at {output_path}\n")
        print(f"This file can be used to populate the Product table in DROP-TABLE.sql")
        
    except Exception as e:
        print(f"🔴 Error during merge process: {str(e)}")
        sys.exit(1)