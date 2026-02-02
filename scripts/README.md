# Scripts de Análisis de Proyecto

Esta carpeta contiene scripts útiles para analizar y documentar la estructura del proyecto.

## Scripts Disponibles

### 1. `generate-tree.js`
Genera un árbol visual completo de la estructura de directorios del proyecto.

**Uso:**
```bash
node scripts/generate-tree.js
```

**Salida:**
- Crea archivo `PROJECT_TREE.txt` en la raíz del proyecto
- Contiene una visualización jerárquica de todas las carpetas y archivos
- Ignora automáticamente: `node_modules`, `dist`, `.git`, `postgres_data`, etc.

**Características:**
- ✅ Profundidad máxima de 5 niveles
- ✅ Ordena elementos alfabéticamente
- ✅ Marca directorios con `/`
- ✅ Incluye timestamp de generación

---

### 2. `analyze-project.js`
Analiza la estructura del proyecto y genera un reporte estadístico.

**Uso:**
```bash
node scripts/analyze-project.js
```

**Salida:**
- Crea archivo `PROJECT_REPORT.txt` en la raíz del proyecto
- Muestra estadísticas en consola
- Categoriza directorios y archivos por tipo

**Información incluida:**
- 📈 Total de archivos y directorios
- 📁 Desglose de tipos de directorios (src, components, modules, utils, config, scripts)
- 📄 Desglose de tipos de archivos (.ts, .tsx, .json, etc.)

---

## Uso Rápido

Para ejecutar ambos scripts y obtener documentación completa:

```bash
# Generar árbol
node scripts/generate-tree.js

# Generar reporte
node scripts/analyze-project.js
```

---

## Archivos Ignorados

Automáticamente se ignoran:
- `node_modules/` - Dependencias
- `dist/`, `build/` - Compilados
- `.git/` - Control de versiones
- `postgres_data/` - Base de datos
- `coverage/`, `.next/` - Builds y cache
- Archivos de lock: `package-lock.json`, `yarn.lock`, etc.

---

## Requisitos

- Node.js (v12 o superior)
- Se ejecutan desde la raíz del proyecto

## Notas

- Los scripts son seguros, solo leen archivos
- Los archivos de salida se generan en la raíz del proyecto
- Se pueden ejecutar en cualquier momento sin afectar el proyecto
