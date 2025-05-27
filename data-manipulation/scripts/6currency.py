import re
from pathlib import Path
import sys

def convert_to_zar(amount, currency):
    """Convert amount from given currency to ZAR"""
    # Current exchange rates
    rates = {
        'USD': 17.83,  # 1 USD = 17.83 ZAR
        'ZAR': 1.0,    # 1 ZAR = 1 ZAR (no conversion needed)
        'CNY': 2.48,   # 1 CNY = 2.48 ZAR
        'INR': 0.21    # 1 INR = 0.21 ZAR (or 1 ZAR = 4.77 INR)
    }
    
    if currency not in rates:
        print(f"Warning: Unknown currency {currency}. Keeping original value.")
        return amount
    
    return amount * rates[currency]

def process_prices_file():
    # Define file paths
    base_dir = Path(__file__).parent.parent
    input_file = base_dir / 'original-data' / 'prices.sql'
    output_file = base_dir / 'manipulated-data' / 'prices_in_zar.sql'
    
    # Ensure output directory exists
    output_file.parent.mkdir(exist_ok=True)
    
    # Regular expression to match price entries
    pattern = r'\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*\'(\w+)\'\)'
    
    print(f"Processing prices from {input_file}")
    
    # Read input file
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Extract the INSERT statement header
    header_match = re.search(r'^(INSERT INTO .+? VALUES)\s*', content)
    if not header_match:
        print("🔴 Error: Could not find INSERT statement header")
        sys.exit(1)  # Exit with error code to trigger the red circle in run.py
    
    header = header_match.group(1)
    
    # Find all price entries
    entries = re.findall(pattern, content)
    
    # Convert prices to ZAR
    converted_entries = []
    currencies_found = set()
    conversion_counts = {}
    skipped_count = 0
    
    for initial_price, final_price, currency in entries:
        currencies_found.add(currency)
        
        # Skip conversion if already in ZAR
        if currency == 'ZAR':
            skipped_count += 1
            # Format as SQL entry without currency field
            converted_entry = f"({initial_price}, {final_price})"
            converted_entries.append(converted_entry)
            continue
            
        conversion_counts[currency] = conversion_counts.get(currency, 0) + 1
        
        # Convert string values to float
        initial_price_float = float(initial_price)
        final_price_float = float(final_price)
        
        # Convert to ZAR
        initial_price_zar = convert_to_zar(initial_price_float, currency)
        final_price_zar = convert_to_zar(final_price_float, currency)
        
        # Format as SQL entry without currency field
        converted_entry = f"({initial_price_zar:.2f}, {final_price_zar:.2f})"
        converted_entries.append(converted_entry)
    
    # Create output SQL content
    output_content = header + '\n' + ',\n'.join(converted_entries) + ';'
    
    # Write to output file
    with open(output_file, 'w') as f:
        f.write(output_content)
    
    print(f"Conversion complete. Output written to {output_file}")
    print(f"Currencies found: {', '.join(currencies_found)}")
    print(f"Skipped {skipped_count} prices already in ZAR")
    for currency, count in conversion_counts.items():
        print(f"Converted {count} prices from {currency} to ZAR")

if __name__ == "__main__":
    process_prices_file()