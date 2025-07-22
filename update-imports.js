import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findJSFiles(dir, exclude = ['node_modules', 'dist']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!exclude.includes(file)) {
        results = results.concat(findJSFiles(fullPath, exclude));
      }
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  
  return results;
}

function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar importaciones desde controllers/*.js y cambiarlas a .ts
    const updatedContent = content.replace(
      /(from\s+['"]\.\.\/controllers\/[^'"]+)\.js(['"]\s*;?\s*)/g,
      '$1.ts$2'
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

const rootDir = __dirname;
const jsFiles = findJSFiles(rootDir);

console.log(`Found ${jsFiles.length} .js files to process`);
jsFiles.forEach(updateImports);
console.log('All done!'); 