import { BackendToggleComponent } from './backend-toggle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('BackendToggleComponent - Test Suite Presentacional', () => {
  // Función helper para montar el componente pasándole propiedades de Angular (@Input/@Output)
  const mountComponent = (initialBackend: 'node' | 'springboot' = 'node') => {
    return cy
      .mount(BackendToggleComponent, {
        imports: [BrowserAnimationsModule],
        componentProperties: {
          selectedBackend: initialBackend,
        },
      })
      .then((wrapper) => {
        // Espiamos el EventEmitter nativo de Angular para verificar las emisiones
        cy.spy(wrapper.component.selectionChange, 'emit').as(
          'selectionChangeSpy'
        );
        cy.wrap(wrapper.component).as('componentInstance');
      });
  };

  describe('1. Renderizado y Estado por Defecto (@Input)', () => {
    it('debe renderizar el componente correctamente y mostrar las dos opciones', () => {
      mountComponent();

      // Verificamos el contenedor principal definido en tu SCSS
      cy.get('ion-grid').should('exist');

      // Verificamos que existen los dos botones/opciones
      cy.get('ion-button').should('have.length', 2);

      // Validamos los íconos importados en el constructor
      cy.get('ion-icon[name="logo-nodejs"]').should('exist');
      cy.get('ion-icon[name="leaf-outline"]').should('exist');
    });

    it('debe iniciar con "node" como backend seleccionado por defecto', () => {
      mountComponent(); // No pasamos prop, usa el valor por defecto

      cy.get('@componentInstance')
        .its('selectedBackend')
        .should('equal', 'node');
    });

    it('debe inicializarse con "springboot" si se pasa a través del @Input()', () => {
      mountComponent('springboot'); // Simulamos que el padre le pasa 'springboot'

      cy.get('@componentInstance')
        .its('selectedBackend')
        .should('equal', 'springboot');
    });
  });

  describe('2. Interacciones y Emisión de Eventos (@Output)', () => {
    beforeEach(() => {
      // Montamos el componente con el valor por defecto ('node')
      mountComponent('node');
    });

    it('debe cambiar el estado interno y emitir "springboot" al hacer clic en la opción de Spring Boot', () => {
      // Buscamos el botón que contiene el icono de Spring Boot y le hacemos clic
      // (Buscamos el botón padre del icono 'leaf-outline')
      cy.get('ion-icon[name="leaf-outline"]').closest('ion-button').click();

      // 1. Verificamos que el estado interno del componente cambió
      cy.get('@componentInstance')
        .its('selectedBackend')
        .should('equal', 'springboot');

      // 2. Verificamos que el EventEmitter disparó el evento hacia el padre
      cy.get('@selectionChangeSpy').should(
        'have.been.calledOnceWith',
        'springboot'
      );
    });

    it('debe cambiar el estado interno y emitir "node" al hacer clic en la opción de Node.js', () => {
      // Forzamos un estado inicial distinto para probar el cambio de vuelta
      cy.get('@componentInstance').invoke('select', 'springboot');
      cy.get('@selectionChangeSpy').invoke('resetHistory'); // Limpiamos el espía

      // Hacemos clic en el botón de Node
      cy.get('ion-icon[name="logo-nodejs"]').closest('ion-button').click();

      // 1. Verificamos el estado interno
      cy.get('@componentInstance')
        .its('selectedBackend')
        .should('equal', 'node');

      // 2. Verificamos la emisión
      cy.get('@selectionChangeSpy').should('have.been.calledOnceWith', 'node');
    });
  });

  describe('3. Verificaciones de Lógica de la Función select()', () => {
    it('debe ejecutar la lógica completa al invocar la función select() directamente', () => {
      mountComponent();

      cy.get('@componentInstance').then((instance: any) => {
        // Ejecutamos el método público del componente
        instance.select('springboot');

        // Verificamos mutación
        expect(instance.selectedBackend).to.equal('springboot');
      });

      // Verificamos el espía
      cy.get('@selectionChangeSpy').should(
        'have.been.calledOnceWith',
        'springboot'
      );
    });
  });
});
