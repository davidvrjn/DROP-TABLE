import json
import random
import os
from pathlib import Path

random.seed("DROP TABLE")

def generate_reviews():
    print("\n🔵 Generating product reviews...")
    
    base_dir = Path(__file__).parent.parent
    reviews_json_path = base_dir / 'original-data' / 'reviews.json'
    products_sql_path = base_dir / 'Final Statements' / 'products.sql'
    output_path = base_dir / 'Final Statements' / 'reviews.sql'
    
    try:
        with open(reviews_json_path, 'r') as f:
            review_templates = json.load(f)
        print(f"✅ Loaded {len(review_templates)} review templates")
    except Exception as e:
        print(f"🔴 Failed to load review templates: {str(e)}")
        return
    
    product_ids = []
    try:
        with open(products_sql_path, 'r') as f:
            content = f.read()
            
            lines = content.split('\n')
            for line in lines:
                if 'INSERT INTO `Product`' in line and 'VALUES' in line:
                    continue
                    
                if line.strip().startswith('('):
                    # Extract ID from the first value in the values line
                    product_id = line.split(',')[0].strip('( ')
                    if product_id.isdigit():
                        product_ids.append(int(product_id))
        
        print(f"✅ Found {len(product_ids)} products")
    except Exception as e:
        print(f"🔴 Failed to extract product IDs: {str(e)}")
        return
    
    if not product_ids:
        print("🔴 No product IDs found. Cannot generate reviews.")
        return
    
    # Generate reviews
    reviews = []
    available_user_ids = list(range(2, 17))  # User IDs 2-16
    user_product_pairs = set()
    
    # which products get reviews and how many
    for product_id in product_ids:
        # Random number of reviews (0-15) for each product
        max_possible_reviews = min(15, len(available_user_ids) - len([p for u, p in user_product_pairs if p == product_id]))
        num_reviews = random.randint(0, max_possible_reviews)
        
        if num_reviews > 0:
            # Get users who haven't reviewed this product yet
            eligible_users = [user_id for user_id in available_user_ids 
                             if (user_id, product_id) not in user_product_pairs]
            
            # Select random users for this product
            selected_users = random.sample(eligible_users, min(num_reviews, len(eligible_users)))
            
            # Generate reviews for selected users
            for user_id in selected_users:
                # Select a random review
                review_template = random.choice(review_templates)
                
                # Add the review
                reviews.append({
                    'user_id': user_id,
                    'product_id': product_id,
                    'score': review_template['rating'],
                    'comment': review_template['comment']
                })
                
                # user has reviewed this product
                user_product_pairs.add((user_id, product_id))
    
    print(f"✅ Generated {len(reviews)} reviews using {len(set(r['user_id'] for r in reviews))} users")
    print(f"✅ Reviews cover {len(set(r['product_id'] for r in reviews))} different products")
    
    # Write SQL file with a INSERT statement
    try:
        with open(output_path, 'w') as f:

            if reviews:
                # Write the INSERT statement
                f.write("INSERT INTO `Review` (`user_id`, `product_id`, `score`, `comment`) VALUES\n")
                
                # Write each review as a values clause
                for i, review in enumerate(reviews):
                    # Escape single quotes in comments
                    escaped_comment = review['comment'].replace("'", "\\'") 
                    
                    # Write the values clause
                    f.write(f"({review['user_id']}, {review['product_id']}, {review['score']}, '{escaped_comment}')")
                    
                    # Add comma if not the last review, else semicolon
                    if i < len(reviews) - 1:
                        f.write(",\n")
                    else:
                        f.write(";\n")
            else:
                f.write("-- No reviews were generated\n")
        
        print(f"✅ Successfully wrote reviews to {output_path}")
    except Exception as e:
        print(f"🔴 Failed to write reviews SQL: {str(e)}")

if __name__ == "__main__":
    generate_reviews()