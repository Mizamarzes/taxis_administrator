const fs = require('fs');
const path = require('path');

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

// Estadísticas
let stats = {
  files: 0,
  directories: 0,
  fileTypes: {},
  directoriesByType: {
    src: 0,
    components: 0,
    modules: 0,
    utils: 0,
    config: 0,
    scripts: 0,
    other: 0
  }
};

function getFileType(filename) {
  const ext = path.extname(filename);
  return ext || 'sin extensión';
}

function categorizeDirName(dirName) {
  if (dirName.includes('src')) return 'src';
  if (dirName.includes('component')) return 'components';
  if (dirName.includes('module')) return 'modules';
  if (dirName.includes('util') || dirName.includes('helper')) return 'utils';
  if (dirName.includes('config')) return 'config';
  if (dirName.includes('script')) return 'scripts';
  return 'other';
}

function analyzeTree(dir, depth = 0) {
  if (depth > MAX_DEPTH) return;

  try {
    const items = fs.readdirSync(dir);
    const filtered = items.filter(item => !IGNORE.includes(item));

    filtered.forEach(item => {
      const fullPath = path.join(dir, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          stats.directories++;
          stats.directoriesByType[categorizeDirName(item)]++;
          analyzeTree(fullPath, depth + 1);
        } else {
          stats.files++;
          const fileType = getFileType(item);
          stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
        }
      } catch (e) {
        // Ignorar errores
      }
    });
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

function generateReport() {
  const projectRoot = path.join(__dirname, '..');
  const timestamp = new Date().toLocaleString('es-ES');

  console.log('\n📊 ANÁLISIS DEL PROYECTO\n');
  console.log(`Fecha: ${timestamp}\n`);

  // Analizar estructura
  analyzeTree(projectRoot);

  // Generar reporte
  let report = `REPORTE DE ESTRUCTURA DEL PROYECTO\n`;
  report += `Generado: ${timestamp}\n`;
  report += `${'='.repeat(50)}\n\n`;

  report += `📈 ESTADÍSTICAS GENERALES\n`;
  report += `${'-'.repeat(50)}\n`;
  report += `Total de archivos: ${stats.files}\n`;
  report += `Total de directorios: ${stats.directories}\n\n`;

  report += `📁 TIPOS DE DIRECTORIOS\n`;
  report += `${'-'.repeat(50)}\n`;
  for (const [tipo, cantidad] of Object.entries(stats.directoriesByType)) {
    if (cantidad > 0) {
      report += `${tipo}: ${cantidad}\n`;
    }
  }
  report += `\n`;

  report += `📄 TIPOS DE ARCHIVOS\n`;
  report += `${'-'.repeat(50)}\n`;
  const sortedTypes = Object.entries(stats.fileTypes).sort((a, b) => b[1] - a[1]);
  for (const [tipo, cantidad] of sortedTypes) {
    report += `${tipo}: ${cantidad}\n`;
  }

  // Guardar reporte
  const reportPath = path.join(projectRoot, 'PROJECT_REPORT.txt');
  fs.writeFileSync(reportPath, report);

  // Mostrar en consola
  console.log(report);
  console.log(`\n✅ Reporte guardado en: PROJECT_REPORT.txt`);
}

generateReport();
