from bs4 import BeautifulSoup

# Load the HTML content from the file
with open('all', 'r') as file:
    html_content = file.read()

# Parse the HTML using Beautiful Soup
soup = BeautifulSoup(html_content, 'html.parser')

# Find all anchor tags with class '_company_99gj3_339'
company_links = soup.find_all('a', class_='_company_99gj3_339')

# Extract the href attribute to get the links
links = [link.get('href') for link in company_links]

print(len(links))