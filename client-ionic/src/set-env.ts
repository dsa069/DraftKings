import { writeFile } from 'node:fs';
import * as dotenv from 'dotenv';

dotenv.config();

dotenv.config({ path: './src/secrets/.env' });

// Definimos la lógica de qué buscar para cada archivo
const configMapping = [
  {
    targetPath: './src/environments/environment.ts',
    production: false,
    // Prioridad para desarrollo: 1º DEV, 2º LOCAL
    possibleVars: ['FIREBASE_CONFIG_DEV', 'FIREBASE_CONFIG_LOCAL'],
  },
  {
    targetPath: './src/environments/environment.prod.ts',
    production: true,
    // Para producción solo queremos la de PROD
    possibleVars: ['FIREBASE_CONFIG_PROD'],
  },
];

configMapping.forEach((config) => {
  let selectedSecret = null;
  let varNameUsed = '';

  // Buscamos en orden de prioridad según la lista 'possibleVars'
  for (const varName of config.possibleVars) {
    if (process.env[varName]) {
      selectedSecret = process.env[varName];
      varNameUsed = varName;
      break; // En cuanto encuentra uno, deja de buscar
    }
  }

  if (selectedSecret) {
    try {
      const firebaseConfig = JSON.parse(selectedSecret);

      const fileContent = `export const environment = {
  production: ${config.production},
  firebaseConfig: ${JSON.stringify(firebaseConfig, null, 2)}
};
`;

      writeFile(config.targetPath, fileContent, (err) => {
        if (err) throw err;
        console.log(`✅ ${config.targetPath} generado usando: ${varNameUsed}`);
      });
    } catch (e) {
      console.error(
        `❌ Error parseando el JSON de ${varNameUsed}. Asegúrate de que el valor en el .env sea un JSON válido.`,
      );
    }
  } else {
    console.log(
      `--- Saltando ${config.targetPath}: No se encontró ninguna de estas variables: [${config.possibleVars.join(', ')}] ---`,
    );
  }
});
