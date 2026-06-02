import { SwitchBackPage } from './switch-back.page';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigService } from '../../core/services/config.service';
import { NavController, ToastController } from '@ionic/angular';

describe('SwitchBackPage - Cypress Component Tests', () => {
  beforeEach(() => {
    // Clear any previous pending change
    cy.window().then((win) =>
      win.localStorage.removeItem('pending_backend_change')
    );

    const applyStub = cy.stub().as('applyBackendStub');
    const navigateStub = cy.stub().as('navigateStub');
    const mockConfig = {
      selectedBackend: () => 'node',
      applyBackendChange: applyStub,
    };
    const mockNav = { navigateForward: navigateStub };
    const mockToast = {
      create: () => Promise.resolve({ present: () => Promise.resolve() }),
    };

    cy.mount(SwitchBackPage, {
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: ConfigService, useValue: mockConfig },
        { provide: NavController, useValue: mockNav },
        { provide: ToastController, useValue: mockToast },
      ],
    }).then((wrapper) => {
      cy.wrap(wrapper.component).as('componentInstance');
    });
  });

  it('should render the page', () => {
    cy.get('ion-content').should('exist');
  });

  it('onBackendChange updates selectedBackend', () => {
    cy.get('@componentInstance').then((instance: any) => {
      instance.onBackendChange('springboot');
      expect(instance.selectedBackend).to.equal('springboot');
    });
  });

  it('confirmBackendChange saves pending change, applies change and navigates', () => {
    // Set a different backend and confirm
    cy.get('@componentInstance').then((instance: any) => {
      instance.selectedBackend = 'springboot';
      instance.confirmBackendChange();
    });

    cy.window().then((win) => {
      expect(win.localStorage.getItem('pending_backend_change')).to.equal(
        'springboot'
      );
    });

    cy.get('@applyBackendStub').should('have.been.calledWith', 'springboot');
    cy.get('@navigateStub').should('have.been.called');
  });
});
