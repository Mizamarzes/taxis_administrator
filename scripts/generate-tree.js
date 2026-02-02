const fs = require('fs');
const path = require('path');

// Carpetas a ignorar en cualquier nivel
const IGNORE = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '.next',
  '.env',
  '.env.local',
  'postgres_data',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

const MAX_DEPTH = 5;

function generateTree(dir, prefix = '', depth = 0, isLast = true) {
  if (depth > MAX_DEPTH) return '';

  let output = '';

  try {
    const items = fs.readdirSync(dir).sort();
    const filtered = items.filter(item => !IGNORE.includes(item));

    filtered.forEach((item, index) => {
      const fullPath = path.join(dir, item);
      const isLastItem = index === filtered.length - 1;
      const connector = isLastItem ? '└── ' : '├── ';
      const extension = isLastItem ? '    ' : '│   ';

      let itemStr = item;
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          itemStr += '/';
        }
      } catch (e) {
        // Ignorar errores de stat
      }

      output += `${prefix}${connector}${itemStr}\n`;

      // Recursión en directorios
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          const newPrefix = prefix + extension;
          output += generateTree(fullPath, newPrefix, depth + 1, isLastItem);
        }
      } catch (e) {
        // Ignorar errores
      }
    });
  } catch (e) {
    console.error(`Error al leer directorio ${dir}:`, e.message);
  }

  return output;
}

function generateProjectTree() {
  const projectRoot = path.join(__dirname, '..');
  const timestamp = new Date().toLocaleString('es-ES');

  let treeOutput = `Estructura del Proyecto\n`;
  treeOutput += `Generado: ${timestamp}\n\n`;
  treeOutput += `taxis_administrator/\n`;
  treeOutput += generateTree(projectRoot, '', 0);

  // Guardar en archivo
  const outputPath = path.join(projectRoot, 'PROJECT_TREE.txt');
  fs.writeFileSync(outputPath, treeOutput);
  
  console.log(`✅ Árbol del proyecto generado en: PROJECT_TREE.txt`);
  console.log(`📊 Total de líneas: ${treeOutput.split('\n').length}`);
}

// Ejecutar
generateProjectTree();
