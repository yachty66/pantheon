const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'webpage', 'index.html'); // Adjust this path if necessary
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Ensure this is set in Vercel's environment variables
htmlContent = htmlContent.replace('__API_KEY__', apiKey);

fs.writeFileSync(htmlPath, htmlContent);