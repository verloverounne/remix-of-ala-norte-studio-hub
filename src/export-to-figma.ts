/**
 * Script: Convertir tokens de Supabase → Figma Tokens Studio
 * 
 * USO:
 * 1. Descargá tokens desde /admin/design-tokens (botón DESCARGAR)
 * 2. Guardá el archivo como: design-tokens/from-supabase.json
 * 3. Ejecutá: npx tsx src/scripts/export-to-figma.ts
 * 4. Importá el resultado en Tokens Studio (Figma)
 */

import fs from 'fs';
import path from 'path';

// Lee el JSON exportado desde tu admin panel
const inputPath = path.join(process.cwd(), 'design-tokens', 'from-supabase.json');
const supabaseData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Estructura para Tokens Studio
const figmaTokens: any = {};

// Agrupa por categoría
Object.entries(supabaseData).forEach(([key, value]) => {
  // key ejemplo: "color.primary"
  // value ejemplo: "#DC143C"
  
  const parts = key.split('.');
  const category = parts[0];  // "color"
  const name = parts.slice(1).join('.'); // "primary"
  
  if (!figmaTokens[category]) {
    figmaTokens[category] = {};
  }
  
  // Detecta el tipo basándose en la categoría
  let type = 'other';
  if (category === 'color') type = 'color';
  else if (category === 'radius') type = 'borderRadius';
  else if (category === 'shadow') type = 'boxShadow';
  else if (category.startsWith('font')) type = 'typography';
  else if (category === 'spacing') type = 'spacing';
  
  figmaTokens[category][name] = {
    value: value,
    type: type
  };
});

// Guarda el resultado
const outputPath = path.join(process.cwd(), 'design-tokens', 'for-figma-import.json');
fs.writeFileSync(outputPath, JSON.stringify(figmaTokens, null, 2), 'utf-8');

console.log('✅ Tokens convertidos para Figma!');
console.log('📁 Archivo guardado en:', outputPath);
console.log('\n📝 Próximos pasos:');
console.log('1. Abrí Tokens Studio en Figma');
console.log('2. Settings → Load from file');
console.log('3. Seleccioná: design-tokens/for-figma-import.json');
