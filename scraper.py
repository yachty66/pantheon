import os
from bs4 import BeautifulSoup

# Directory containing the batch files
directory = 'batches'

# List to store all company names
all_company_names = []

# Iterate over all files in the directory
for filename in os.listdir(directory):
    #print(f"Processing file: {filename}")
    #if filename.endswith('.html') or filename == 'all':  # Adjust the condition based on your file types
    filepath = os.path.join(directory, filename)
    
    # Load the HTML content from the file
    with open(filepath, 'r') as file:
        html_content = file.read()
    
    # Print the first 500 characters of the HTML content for debugging
    #print(f"HTML content of {filename} (first 500 chars): {html_content[:500]}")
    
    # Parse the HTML using Beautiful Soup
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all anchor tags with class '_company_99gj3_339'
    company_links = soup.find_all('a', class_='_company_99gj3_339')
    #print(f"Found {len(company_links)} company links in {filename}")
    
    # Extract the company names from the nested spans
    company_names = [link.find(class_='_coName_99gj3_454').text for link in company_links if link.find(class_='_coName_99gj3_454')]
    
    # Add the company names to the list
    all_company_names.extend(company_names)

# Print or process the company names
#print(f"Total company names found: {len(all_company_names)}")
print(all_company_names)
