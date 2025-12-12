const fs = require('fs');
const path = require('path');

const IGNORE = ['node_modules', 'dist', '.git', 'coverage', '.next'];
const MAX_DEPTH = 4;

function generateTree(dir, prefix = '', depth = 0) {
  if (depth > MAX_DEPTH) return '';
  
  const items = fs.readdirSync(dir);
  let output = '';
  
  items
    .filter(item => !IGNORE.includes(item))
    .forEach((item, index) => {
      const fullPath = path.join(dir, item);
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      
      output += `${prefix}${connector}${item}\n`;
      
      if (fs.statSync(fullPath).isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        output += generateTree(fullPath, newPrefix, depth + 1);
      }
    });
  
  return output;
}

const tree = 'src/\n' + generateTree('./src');
fs.writeFileSync('project-tree.txt', tree);
console.log('✅ Árbol generado en project-tree.txt');