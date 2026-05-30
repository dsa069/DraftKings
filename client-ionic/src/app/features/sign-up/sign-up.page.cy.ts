import { SignUpPage } from './sign-up.page';
import { AuthService } from '../../core/services/abstract/auth.service';
import { ConfigService } from '../../core/services/config.service';
import { NavController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('SignUpPage Component', () => {
  let authServiceMock: any;
  let configServiceMock: any;
  let navCtrlMock: Partial<NavController>;
  let toastCtrlMock: Partial<ToastController>;
  let toastPresentSpy: any;

  beforeEach(() => {
    toastPresentSpy = cy.stub().resolves();
    toastCtrlMock = {
      create: cy.stub().resolves({
        present: toastPresentSpy,
      } as any),
    };

    navCtrlMock = {
      navigateRoot: cy.stub().resolves(true),
      navigateBack: cy.stub().resolves(true),
    };

    configServiceMock = {
      selectedBackend: cy.stub().returns('node'),
      applyBackendChange: cy.stub(),
    };

    authServiceMock = {
      registerFirebase: cy.stub().resolves({ user: { uid: '123' } }),
      registerBackend: cy.stub().resolves({}),
      deleteCurrentUser: cy.stub().resolves(),
    };
  });

  const mountComponent = () => {
    cy.mount(SignUpPage, {
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: NavController, useValue: navCtrlMock },
        { provide: ToastController, useValue: toastCtrlMock },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  const fillSignUpForm = (values: {
    userName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    cy.get('@componentInstance').then((instance: any) => {
      expect(instance.signUpForm).to.exist;
      instance.signUpForm.patchValue(values);
      instance.signUpForm.updateValueAndValidity();
    });
  };

  describe('1. Renderizado Inicial e Interfaz Base', () => {
    beforeEach(() => mountComponent());

    it('debe renderizar el formulario y los inputs correctamente', () => {
      cy.get('.hero-title').should('contain.text', 'Build Your');
      cy.get('app-login-card').should('exist');
      cy.get('ion-input[formControlName="userName"]').should('exist');
      cy.get('ion-input[formControlName="email"]').should('exist');
      cy.get('ion-input[formControlName="password"]').should('exist');
      cy.get('ion-input[formControlName="confirmPassword"]').should('exist');
    });

    it('el botón de submit debe estar deshabilitado por defecto (formulario inválido)', () => {
      cy.get('.login-button').should('have.attr', 'form', 'signUpFormId');
      cy.get('@componentInstance').its('signUpForm.invalid').should('be.true');
    });
  });

  describe('2. Navegación Secundaria e Interacciones Menores', () => {
    beforeEach(() => mountComponent());

    it('debe navegar a la pantalla de Login al hacer clic en Log In', () => {
      cy.get('.signup-link').click({ force: true });
      cy.wrap(navCtrlMock.navigateRoot).should(
        'have.been.calledOnceWith',
        '/login'
      );
    });

    it('debe alternar la visibilidad de la contraseña al hacer clic en el ícono del ojo', () => {
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.showPassword).to.be.false;
        instance.togglePasswordVisibility();
        expect(instance.showPassword).to.be.true;
      });
    });
  });
});
