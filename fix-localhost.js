#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos que necesitan ser arreglados
const filesToFix = [
  'src/views/Dashboard/MessagesPage.tsx',
  'src/views/Dashboard/TaskPage.tsx',
  'src/views/Dashboard/UtilitiesPage.tsx',
  'src/components/BookingModal.jsx',
  'src/views/Dashboard/TaskComponents/List.tsx',
  'src/views/Dashboard/TaskComponents/CreateCardModal.tsx',
  'src/views/Dashboard/TaskComponents/CardDetailModal.tsx',
  'src/views/Dashboard/TaskComponents/CreateBoardModal.tsx',
  'src/components/Layout/Header.jsx',
  'src/views/Dashboard/TaskComponents/Board.tsx'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Archivo no encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Agregar import de api si no existe y si hay axios o fetch
    if ((content.includes('axios') || content.includes('fetch(')) && !content.includes("import api from")) {
      // Encontrar la última línea de import
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex >= 0) {
        // Determinar la ruta correcta para api
        const apiPath = filePath.includes('components/') ? '../lib/api' : '../../lib/api';
        lines.splice(lastImportIndex + 1, 0, `import api from '${apiPath}';`);
        content = lines.join('\n');
      }
    }

    // 2. Reemplazar llamadas axios con localhost
    content = content.replace(/axios\.get\('http:\/\/localhost:3000\/api([^']+)'\)/g, "api.get('$1')");
    content = content.replace(/axios\.post\('http:\/\/localhost:3000\/api([^']+)',\s*([^)]+)\)/g, "api.post('$1', $2)");
    content = content.replace(/axios\.put\('http:\/\/localhost:3000\/api([^']+)',\s*([^)]+)\)/g, "api.put('$1', $2)");
    content = content.replace(/axios\.delete\('http:\/\/localhost:3000\/api([^']+)'\)/g, "api.delete('$1')");

    // 3. Reemplazar llamadas fetch con localhost
    content = content.replace(/fetch\('http:\/\/localhost:3000\/api([^']+)'\)/g, "api.get('$1').then(response => ({ ok: response.status < 400, json: () => Promise.resolve(response.data) }))");
    
    // 4. Reemplazar fetch POST más complejo
    content = content.replace(/fetch\('http:\/\/localhost:3000\/api([^']+)',\s*{\s*method:\s*'POST',\s*headers:\s*{\s*'Content-Type':\s*'application\/json',?\s*},\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}\)/g, 
      "api.post('$1', $2).then(response => ({ ok: response.status < 400, json: () => Promise.resolve(response.data) }))");

    // 5. Reemplazar fetch PUT
    content = content.replace(/fetch\(`http:\/\/localhost:3000\/api([^`]+)`,\s*{\s*method:\s*'PUT',\s*headers:\s*{\s*'Content-Type':\s*'application\/json',?\s*},\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}\)/g, 
      "api.put('$1', $2).then(response => ({ ok: response.status < 400, json: () => Promise.resolve(response.data) }))");

    // 6. Reemplazar fetch DELETE
    content = content.replace(/fetch\(`http:\/\/localhost:3000\/api([^`]+)`,\s*{\s*method:\s*'DELETE',\s*headers:\s*{\s*'Content-Type':\s*'application\/json',?\s*},\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}\)/g, 
      "api.delete('$1', { data: $2 }).then(response => ({ ok: response.status < 400, json: () => Promise.resolve(response.data) }))");

    // 7. Limpiar imports de axios si ya no se usa
    if (!content.includes('axios.') && content.includes("import axios from 'axios';")) {
      content = content.replace(/import axios from 'axios';\r?\n?/g, '');
    }

    // 8. Ajustar el manejo de respuestas para que funcione con axios
    content = content.replace(/const result = await response\.json\(\);/g, 'const result = response.data;');
    content = content.replace(/if \(result\.success\)/g, 'if (response.data.success)');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Archivo corregido: ${filePath}`);
    } else {
      console.log(`ℹ️  Sin cambios necesarios: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

console.log('🔧 Iniciando corrección de referencias localhost...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ Proceso completado!');
console.log('📝 Recuerda configurar las variables de entorno en Dokploy:');
console.log('   - NEXT_PUBLIC_API_BASE_URL=https://www.impulsa360.tech/api');
console.log('   - API_BASE_URL=https://www.impulsa360.tech/api');
