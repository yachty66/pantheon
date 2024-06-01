const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'webpage', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
htmlContent = htmlContent.replace('%%GOOGLE_MAPS_API_KEY%%', process.env.GOOGLE_MAPS_API_KEY);
fs.writeFileSync(htmlPath, htmlContent);