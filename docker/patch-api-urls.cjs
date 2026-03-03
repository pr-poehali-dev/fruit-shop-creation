/**
 * Патчит все hardcoded URL functions.poehali.dev на локальный backend.
 * Запускается перед сборкой внутри Docker.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

// UUID → имя функции
const UUID_TO_FUNCTION = {
  '2cc7c24d-08b2-4c44-a9a7-8d09198dbefc': 'auth',
  '5ae817c6-e62e-40c6-8e34-18ffac2d3cfc': 'products',
  'b35bef37-8423-4939-b43b-0fb565cc8853': 'orders',
  '9b1ac59e-93b6-41de-8974-a7f58d4ffaf9': 'settings',
  '0a62d37c-9fd0-4ff3-9b5b-2c881073d3ac': 'categories',
  '60d635ae-584e-4966-b483-528742647efb': 'alfabank-payment',
  'fc281a64-4d76-4cbd-9ae6-6cf970c14f35': 'notifications',
  'ed127250-fe9d-4c7e-9a93-fb8b7fdc038a': 'loyalty-card',
  '44df414c-694f-4079-aa96-764afeaf23e3': 'upload-image',
  '98c69bc9-5dec-4d0e-b5d8-8abc20d4db4d': 'support-chat',
};

const SOURCE_DIR = path.join(__dirname, '..', 'src');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

let totalPatched = 0;

const files = walkDir(SOURCE_DIR);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [uuid, funcName] of Object.entries(UUID_TO_FUNCTION)) {
    const oldUrl = `https://functions.poehali.dev/${uuid}`;
    const newUrl = `${BASE_URL}/${funcName}`;

    if (content.includes(oldUrl)) {
      content = content.split(oldUrl).join(newUrl);
      console.log(`  [OK] ${path.relative(SOURCE_DIR, file)}: ${funcName}`);
      changed = true;
      totalPatched++;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log(`\nPatched ${totalPatched} URL(s) in ${files.length} scanned files.`);
console.log(`Backend URL: ${BASE_URL}`);
