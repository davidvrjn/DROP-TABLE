from pathlib import Path
import os
import sys

BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

def parse_categories():
    print("⏳ Loading categories from categories.sql")
    categories = {}
    try:
        with open(ORIGINAL_DATA / 'categories.sql', 'r') as f:
            lines = [line.strip() for line in f 
                    if line.strip().startswith("('")]
        
        if not lines:
            print("🔴 Error: No category entries found in categories.sql")
            sys.exit(1)
            
        for idx, line in enumerate(lines, start=1):
            try:
                # Extract category name between first pair of quotes
                name = line.split("'")[1]  
                categories[name] = idx
            except IndexError:
                print(f"🔴 Error: Invalid format in line: {line}")
                continue
                
        print(f"✅ Mapped {len(categories)} categories")
        return categories
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'categories.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to parse categories: {str(e)}")
        sys.exit(1)

def process_category_inserts(category_map):
    print(f"🔧 Processing {len(category_map)} categories in products_with_text_category.sql")
    
    try:
        with open(ORIGINAL_DATA / 'products_with_text_category.sql', 'r') as f:
            content = f.read()
        
        # Process INSERT lines while preserving original structure
        insert_lines = [line.strip() for line in content.split('\n') 
                       if line.strip().startswith("('")]
        
        if not insert_lines:
            print("🔴 Error: No product entries found in products_with_text_category.sql")
            sys.exit(1)
            
        updated_lines = []
        missing_categories = 0
        for line in insert_lines:
            try:
                category_name = line.split("'")[1]
                category_id = category_map[category_name]
                updated_lines.append(f"({category_id}),")
            except KeyError:
                print(f"⚠️  Missing category: {category_name}")
                updated_lines.append("(NULL),")
                missing_categories += 1
            except IndexError:
                print(f"🔴 Error: Invalid format in line: {line}")
                updated_lines.append("(NULL),")
                missing_categories += 1
        
        if missing_categories > 0:
            print(f"⚠️  Found {missing_categories} missing categories")
            
        return 'INSERT INTO `Products` (`category_id`) VALUES\n' + '\n'.join(updated_lines)
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {ORIGINAL_DATA / 'products_with_text_category.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to process categories: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Starting category ID conversion")
    try:
        category_map = parse_categories()
        new_sql = process_category_inserts(category_map)
        
        MANIPULATED_DATA.mkdir(exist_ok=True)
        output_path = MANIPULATED_DATA / 'products_with_category_ids.sql'
        
        with open(output_path, 'w') as f:
            f.write(new_sql)
        
        print(f"\n🎉 Successfully generated {output_path}\n")
    except Exception as e:
        print(f"🔴 Error: Category conversion failed: {str(e)}")
        sys.exit(1)