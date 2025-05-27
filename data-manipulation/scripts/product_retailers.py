from pathlib import Path
import sys
import random
import re

# Define paths
BASE_DIR = Path(__file__).parent.parent
ORIGINAL_DATA = BASE_DIR / 'original-data'
MANIPULATED_DATA = BASE_DIR / 'manipulated-data'
random.seed("DROP TABLE")

def get_retailers():
    """Load retailers from retailers.sql"""
    print("⏳ Loading retailers from retailers.sql")
    retailers = []
    try:
        with open(MANIPULATED_DATA / 'retailers.sql', 'r') as f:
            content = f.read()
            
        # Extract retailer data using regex
        pattern = r'\((\d+),\s*\'([^\']+)\',\s*\'([^\']+)\'\)'
        matches = re.findall(pattern, content)
        
        if not matches:
            print("🔴 Error: No retailer entries found in retailers.sql")
            sys.exit(1)
            
        for match in matches:
            retailer_id, name, url = match
            retailers.append((int(retailer_id), name, url))
                
        print(f"✅ Found {len(retailers)} retailers")
        return retailers
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {MANIPULATED_DATA / 'retailers.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to parse retailers: {str(e)}")
        sys.exit(1)

def get_product_count():
    """Determine the number of products from merged_products.sql"""
    print("⏳ Counting products from merged_products.sql")
    try:
        with open(MANIPULATED_DATA / 'merged_products.sql', 'r') as f:
            content = f.read()
            
        # Find the highest product ID
        pattern = r'\((\d+),'
        matches = re.findall(pattern, content)
        
        if not matches:
            print("🔴 Error: No product entries found in merged_products.sql")
            sys.exit(1)
            
        # Convert all matches to integers and find the maximum
        product_ids = [int(match) for match in matches]
        max_product_id = max(product_ids)
        
        print(f"✅ Found {max_product_id} products")
        return max_product_id
    except FileNotFoundError:
        print(f"🔴 Error: File not found: {MANIPULATED_DATA / 'merged_products.sql'}")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Failed to count products: {str(e)}")
        sys.exit(1)

def get_price_data():
    """Load price data from prices_in_zar.sql"""
    print("⏳ Loading price data from prices_in_zar.sql")
    try:
        with open(MANIPULATED_DATA / 'prices_in_zar.sql', 'r') as f:
            content = f.read()
        
        # Extract price pairs using regex
        pattern = r'\(([\d.]+),\s*([\d.]+)\)'
        matches = re.findall(pattern, content)
        
        if not matches:
            print("🔴 Error: No price entries found in prices_in_zar.sql")
            sys.exit(1)
            
        return [(float(init), float(final)) for init, final in matches]
    except Exception as e:
        print(f"🔴 Error loading prices: {str(e)}")
        sys.exit(1)

def generate_product_retailer_data(product_count, retailers):
    """Generate random product-retailer relationships with prices"""
    print("🔧 Generating product-retailer relationships")
    price_data = get_price_data()
    product_retailer_data = []
    
    for product_id in range(1, product_count + 1):
        # Get price pair specific to this product
        price_index = (product_id - 1) % len(price_data)
        base_init, base_final = price_data[price_index]
        
        num_retailers = random.randint(1, len(retailers))
        selected_retailers = random.sample(retailers, num_retailers)
        
        for retailer_id, retailer_name, retailer_url in selected_retailers:
            # Apply retailer-specific scaling
            scale_factor = random.uniform(0.85, 1.15)
            initial_price = round(base_init * scale_factor, 2)
            
            # Generate weighted discount
            discount = random.triangular(0, 99, 0)
            final_price = round(initial_price * (1 - discount/100), 2)
            
            product_url = f"{retailer_url}"
            
            product_retailer_data.append((product_id, retailer_id, product_url, initial_price, final_price))

    print(f"✅ Generated {len(product_retailer_data)} product-retailer relationships")
    return product_retailer_data

def create_product_retailer_sql(product_retailer_data):
    """Create SQL insert statements for product-retailer data"""
    print("🔧 Creating SQL for product-retailer relationships")
    try:
        # Create SQL insert statement
        output_lines = ["INSERT INTO `Product_Retailer` (`product_id`, `retailer_id`, `product_url`, `initial_price`, `final_price`) VALUES"]
        
        for product_id, retailer_id, product_url, initial_price, final_price in product_retailer_data:
            # Format the values for SQL insert
            output_lines.append(f"({product_id}, {retailer_id}, '{product_url}', {initial_price}, {final_price}),")
        
        # Replace the last comma with a semicolon
        output_lines[-1] = output_lines[-1].replace("),", ");")
        
        return "\n".join(output_lines)
    except Exception as e:
        print(f"🔴 Error: Failed to create SQL: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("🚀 Starting product-retailer processing")
    try:
        retailers = get_retailers()
        product_count = get_product_count()
        product_retailer_data = generate_product_retailer_data(product_count, retailers)
        sql_output = create_product_retailer_sql(product_retailer_data)
        
        # Ensure output directory exists
        MANIPULATED_DATA.mkdir(exist_ok=True)
        
        # Write to new file
        output_path = MANIPULATED_DATA / 'product_retailers.sql'
        with open(output_path, 'w') as f:
            f.write(sql_output)
        
        print(f"\n🎉 Successfully generated {output_path} with {len(product_retailer_data)} product-retailer relationships\n")
    except Exception as e:
        print(f"🔴 Error: Product-retailer processing failed: {str(e)}")
        sys.exit(1)