import os
from bs4 import BeautifulSoup

# Directory containing the batch files
directory = 'batches'

# List to store all company links
all_company_links = []

# Iterate over all files in the directory
for filename in os.listdir(directory):
    #print(f"Processing file: {filename}")
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
    
    # Extract the href attribute to get the company links
    links = [link.get('href') for link in company_links]
    
    # Add the company links to the list
    all_company_links.extend(links)

# Print or process the company links
print(f"Total company links found: {len(all_company_links)}")
