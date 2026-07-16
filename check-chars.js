const fs = require('fs');
const content = fs.readFileSync('./app/components/sections/HeroSection.tsx', 'utf-8');
const lines = content.split('\n');
console.log(lines[42].split('').map(c => c.charCodeAt(0)));
console.log(lines[43].split('').map(c => c.charCodeAt(0)));
