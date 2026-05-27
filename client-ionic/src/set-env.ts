import { writeFile } from 'node:fs';
import * as dotenv from 'dotenv';

dotenv.config();

dotenv.config({ path: './src/secrets/.env' });

function getEnvValue(possibleVars: string[]) {
  for (const varName of possibleVars) {
    if (process.env[varName]) {
      return process.env[varName];
    }
  }
  return null;
}

// Definimos la lógica de qué buscar para cada archivo
const configMapping = [
  {
    targetPath: './src/environments/environment.ts',
    production: false,
    firebaseConfigVars: ['FIREBASE_CONFIG_DEV', 'FIREBASE_CONFIG_LOCAL'],
    springApiUrlVars: ['SPRING_API_URL_DEV', 'SPRING_API_URL_LOCAL'],
    nodeApiUrlVars: ['NODE_API_URL_DEV', 'NODE_API_URL_LOCAL'],
  },
  {
    targetPath: './src/environments/environment.prod.ts',
    production: true,
    firebaseConfigVars: ['FIREBASE_CONFIG_PROD'],
    springApiUrlVars: ['SPRING_API_URL_PROD'],
    nodeApiUrlVars: ['NODE_API_URL_PROD'],
  },
];

configMapping.forEach((config) => {
  const firebaseConfigValue = getEnvValue(config.firebaseConfigVars);
  const springApiUrlValue = getEnvValue(config.springApiUrlVars);
  const nodeApiUrlValue = getEnvValue(config.nodeApiUrlVars);

  // Intentamos parsear Firebase si existe, si no, objeto vacío
  let firebaseParsed = {};
  try {
    if (firebaseConfigValue) firebaseParsed = JSON.parse(firebaseConfigValue);
  } catch (e) {
    console.error(`❌ Error parseando firebaseConfig`);
  }

  // El contenido se genera SIEMPRE. Si no hay valor, se pone string vacío
  const fileContent = `export const environment = {
  production: ${config.production},
  firebaseConfig: ${JSON.stringify(firebaseParsed, null, 2)},
  springApiUrl: '${springApiUrlValue || ''}',
  nodeApiUrl: '${nodeApiUrlValue || ''}',
};
`;

  writeFile(config.targetPath, fileContent, (err) => {
    if (err) throw err;
    console.log(
      `✅ ${config.targetPath} generado (Producción: ${config.production})`
    );
  });
});
