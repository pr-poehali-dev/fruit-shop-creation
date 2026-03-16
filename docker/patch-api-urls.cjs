/**
 * Патчит все hardcoded URL functions.poehali.dev на локальный backend.
 * Запускается перед сборкой внутри Docker.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

// UUID → имя функции (полный маппинг всех функций проекта)
const UUID_TO_FUNCTION = {
  // Основные функции (func2url.json)
  '2cc7c24d-08b2-4c44-a9a7-8d09198dbefc': 'auth',
  '5ae817c6-e62e-40c6-8e34-18ffac2d3cfc': 'products',
  'b35bef37-8423-4939-b43b-0fb565cc8853': 'orders',
  '9b1ac59e-93b6-41de-8974-a7f58d4ffaf9': 'settings',
  '0a62d37c-9fd0-4ff3-9b5b-2c881073d3ac': 'categories',
  '60d635ae-584e-4966-b483-528742647efb': 'alfabank-payment',
  '563d9333-4b51-4637-82a8-c2a66058792a': 'alfabank-webhook',
  'fc281a64-4d76-4cbd-9ae6-6cf970c14f35': 'notifications',
  'ed127250-fe9d-4c7e-9a93-fb8b7fdc038a': 'loyalty-card',
  '44df414c-694f-4079-aa96-764afeaf23e3': 'upload-image',
  '98c69bc9-5dec-4d0e-b5d8-8abc20d4db4d': 'support-chat',
  'a833bb69-e590-4a5f-a513-450a69314192': 'support',
  '5417d2b2-c525-4686-856d-577e2d90240c': 'statistics',
  '14c40ab2-8b60-4ccc-b428-bb824cb6871c': 'admin-get-logs',
  '4986919b-8daf-4d91-b11a-b3bde148f13f': 'admin-update-profile',
  '56deea36-35f7-4c07-becc-dedeaa3de78d': 'content-manager',
  'c2c15ef8-454e-4315-bff3-7109e95d5f3d': 'user-tickets',
  'ff57c64d-2ef3-40a0-b0ef-d3ecc109a1fa': 'plants-inventory',
  '8c8e301f-2323-4f3b-85f0-14a3c210e670': 'delivery-zones',
  'c7d83bd6-2027-4170-8c35-7f6462c5274a': 'password-reset',
  '91674d2e-1306-4ae6-9c23-ab0938e8ce5c': 'ratings',
  '4a59ecd1-c528-41e9-a77d-003da941bcf4': 'google-auth',
  '77f82e21-01e9-4f2b-98c5-de4ef28792ad': 'favorites',
  // UUID из src/config/api.ts (дополнительные функции)
  '597de3a8-5db2-4e46-8835-5a37042b00f1': 'auth',
  'cc3b9628-07ec-420e-b340-1c20cad986da': 'auth',
  'e779e7ac-e5aa-4f88-b2dc-e856132ad15d': 'users-api',
  '7f682e02-1640-40e7-8e2a-7a4e7723b309': 'payments-api',
  '57770127-fe63-43db-9fb1-87a2bbe27010': 'categories',
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