const fs = require('fs');
const path = require('path');

// Adjust the path to point to the correct location of index.html
const htmlPath = path.join(__dirname, 'webpage', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Ensure this is set in Vercel's environment variables

if (!apiKey) {
    console.error('API key is not set in the environment variables.');
    process.exit(1);
}

console.log('API key found:', apiKey);

htmlContent = htmlContent.replace('__API_KEY__', apiKey);

fs.writeFileSync(htmlPath, htmlContent);
console.log('API key replaced successfully.');