## Data Manipulation Branch

Simply run the `run.py` script to execute all data manipulation steps.

#### Numbered Scripts (Execution Order):
1. `1brands.py` - Brand ID mapping 
   - Processes `brands.sql` → `products_with_brand_ids.sql`
2. `2categories.py` - Category ID mapping
   - Processes `categories.sql` → `products_with_category_ids.sql`
3. `3specifications.py` - JSON spec generation
   - Combines brand/category/dimension data
4. `4merge.py` - Core data consolidation
   - Merges outputs from previous scripts
5. `5retailers.py` - Retailer setup
   - Processes `retailers.txt` → `retailers.sql`
6. `6currency.py` - Price conversion
   - Processes `prices.sql` → `prices_in_zar.sql`
7. `product_retailers.py` - Final relationships
   - Processes `merged_products.sql`, `retailers.sql`, `prices_in_zar.sql` → `product_retailers.sql`
8. `reviews.py` - Review processing
   - Processes `products.sql`, `reviews.json` → `reviews.sql`

#### Final Processing:
After all scripts are executed, the `run.py` script performs these final operations:

1. `copyfiles()` - Copies all necessary SQL files to the 'Final Statements' directory
2. `createSQL()` - Creates a complete database setup file
   - Combines schema from `db-schema/DROP-TABLE.sql` with all data files in the 'Final Statements' directory
   - Outputs a single comprehensive SQL file: `DROP-TABLE-COMPLETE.sql`