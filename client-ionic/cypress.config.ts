import { defineConfig } from 'cypress';
export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:8100',
    supportFile: false,
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
      webpackConfig: {
        devServer: {
          // Esta es la clave: permite que Codespaces se conecte al socket
          allowedHosts: 'all',
          client: {
            // Evita que intente validar el origen del WebSocket
            logging: 'none',
            overlay: false,
          },
        },
      },
      options: {
        projectConfig: {
          root: './',
          sourceRoot: 'src',
          buildOptions: {
            outputPath: 'dist/browser',
          },
        },
      },
    },
    specPattern: '**/*.cy.ts',
  },
});
