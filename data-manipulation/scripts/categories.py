from pathlib import Path
import os

BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'

def parse_categories():
    print("⏳ Loading categories from categories.sql")
    categories = {}
    with open(ORIGINAL_DATA / 'categories.sql', 'r') as f:
        lines = [line.strip() for line in f 
                if line.strip().startswith("('")]
    
    for idx, line in enumerate(lines, start=1):
        # Extract category name between first pair of quotes
        name = line.split("'")[1]  
        categories[name] = idx
    print(f"✅ Mapped {len(categories)} categories")
    return categories

def process_category_inserts(category_map):
    print(f"🔧 Processing {len(category_map)} categories in products_with_text_category.sql")
    
    with open(ORIGINAL_DATA / 'products_with_text_category.sql', 'r') as f:
        content = f.read()
    
    # Process INSERT lines while preserving original structure
    insert_lines = [line.strip() for line in content.split('\n') 
                   if line.strip().startswith("('")]
    
    updated_lines = []
    for line in insert_lines:
        try:
            category_name = line.split("'")[1]
            category_id = category_map[category_name]
            updated_lines.append(f"({category_id}),")
        except KeyError:
            print(f"⚠️  Missing category: {category_name}")
            updated_lines.append("(NULL),")
    
    return 'INSERT INTO `Products` (`category_id`) VALUES\n' + '\n'.join(updated_lines)

if __name__ == '__main__':
    print("🚀 Starting category ID conversion")
    category_map = parse_categories()
    new_sql = process_category_inserts(category_map)
    
    MANIPULATED_DATA.mkdir(exist_ok=True)
    output_path = MANIPULATED_DATA / 'products_with_category_ids.sql'
    
    with open(output_path, 'w') as f:
        f.write(new_sql)
    
    print(f"\n🎉 Successfully generated {output_path}\n")