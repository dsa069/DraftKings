import { Component } from '@angular/core';
import { LoginCardComponent } from './login-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// 1. Componente Host "Falso" para probar la proyección de contenido (<ng-content>)
@Component({
  standalone: true,
  imports: [LoginCardComponent],
  template: `
    <app-login-card>
      <div id="projected-dummy-input">Contenido Inyectado por el Padre</div>
    </app-login-card>
  `,
})
class TestHostComponent {}

describe('LoginCardComponent - Test Suite Exhaustivo', () => {
  // 2. Helper de montaje estándar para aislar el componente
  const mountComponent = (props?: Partial<LoginCardComponent>) => {
    return cy
      .mount(LoginCardComponent, {
        imports: [BrowserAnimationsModule],
        componentProperties: {
          ...props,
        },
      })
      .then((wrapper) => {
        // Espiamos los EventEmitters nativos de Angular
        cy.spy(wrapper.component.footerActionClick, 'emit').as(
          'footerActionSpy'
        );

        // Guardamos la instancia
        cy.wrap(wrapper.component).as('componentInstance');
      });
  };

  describe('1. Renderizado por Defecto e Interfaz Base', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar la tarjeta base, contenido y pie de página de Ionic', () => {
      cy.get('ion-card.login-card').should('exist');
      cy.get('ion-card-content.login-form-wrapper').should('exist');
      cy.get('ion-footer.signup-section').should('exist');
    });

    it('debe mostrar los valores por defecto si no se pasan @Inputs', () => {
      // El botón de submit debe decir "Confirm" por defecto
      cy.get('.login-button').should('contain.text', 'Confirm');

      // El atributo se mantiene, pero con valor vacío cuando no llega formId
      cy.get('.login-button').should('have.attr', 'form', '');
    });

    it('debe incluir el icono de flecha nativo en el botón principal', () => {
      // Validamos que el icono se añadió en el constructor y se renderiza en el slot end
      cy.get('.login-button ion-icon')
        .should('have.attr', 'name', 'arrow-forward-outline')
        .and('have.attr', 'slot', 'end');
    });
  });

  describe('2. Reactividad de los @Inputs (Data Binding)', () => {
    it('debe mapear correctamente los textos personalizados del footer y el botón', () => {
      mountComponent({
        submitText: 'Entrar al Juego',
        footerText: '¿Aún no tienes equipo?',
        footerActionText: 'Regístrate aquí',
      });

      // Validamos botón de submit
      cy.get('.login-button').should('contain.text', 'Entrar al Juego');

      // Validamos textos del footer
      cy.get('.signup-text').should('contain.text', '¿Aún no tienes equipo?');
      cy.get('.signup-link').should('contain.text', 'Regístrate aquí');
    });

    it('debe vincular el [attr.form] del botón de submit al ID del formulario padre', () => {
      const dummyFormId = 'dk-login-form';
      mountComponent({ formId: dummyFormId });

      // Vital para accesibilidad y funcionamiento de formularios HTML5
      cy.get('.login-button').should('have.attr', 'form', dummyFormId);
    });
  });

  describe('3. Interacciones y Emisión de Eventos (@Outputs)', () => {
    beforeEach(() => mountComponent());

    it('debe emitir el evento footerActionClick al hacer clic en el enlace inferior', () => {
      // Forzamos un texto para encontrar el botón más fácilmente
      mountComponent({ footerActionText: 'Crear cuenta' });

      cy.get('.signup-link').click();

      // Verificamos que el EventEmitter disparó hacia el padre
      cy.get('@footerActionSpy').should('have.been.calledOnce');
    });

    // Nota: las pruebas relacionadas con el EventEmitter `backendChange`
    // se han eliminado intencionadamente para separar responsabilidades.
  });

  describe('4. Proyección de Contenido (<ng-content>)', () => {
    it('debe renderizar el contenido HTML inyectado por el componente padre', () => {
      // En lugar del helper, montamos nuestro componente Host que envuelve al LoginCard
      cy.mount(TestHostComponent, {
        imports: [BrowserAnimationsModule],
      });

      // Verificamos que la tarjeta se renderizó
      cy.get('ion-card').should('exist');

      // Verificamos que el contenido inyectado dentro del tag padre esté presente en el DOM
      cy.get('#projected-dummy-input')
        .should('exist')
        .and('be.visible')
        .and('contain.text', 'Contenido Inyectado por el Padre');
    });
  });
});
