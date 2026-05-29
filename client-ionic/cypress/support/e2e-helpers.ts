export const firebaseSignInUrl =
  /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword\?key=.*/;
export const firebaseSignUpUrl =
  /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signUp\?key=.*/;
export const firebaseDeleteUserUrl =
  /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:delete\?key=.*/;

export function visitApp(path: string): void {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  cy.visit(`/#${normalizedPath}`, {
    onBeforeLoad(win) {
      win.localStorage.clear();
      win.sessionStorage.clear();
      win.localStorage.setItem('selected_backend', 'node');

      try {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
        win.indexedDB.deleteDatabase('firebase-heartbeat-database');
      } catch {
        // Si IndexedDB no está disponible, la app seguirá cargando con estado limpio suficiente para estos tests.
      }
    },
  });
}

export function getIonInput(selector: string) {
  return cy.get(selector).shadow().find('input, textarea');
}

export function typeIntoIonInput(
  selector: string,
  value: string,
  options: Partial<Cypress.TypeOptions> = {}
): Cypress.Chainable<any> {
  const typeOptions = {
    ...options,
    force: true,
  } as Cypress.TypeOptions;

  return getIonInput(selector).clear({ force: true }).type(value, typeOptions);
}

export function clearIonInput(selector: string): Cypress.Chainable<any> {
  return getIonInput(selector).clear({ force: true });
}

export function setIonSelectValue(
  selector: string,
  value: string
): Cypress.Chainable<any> {
  return cy.get(selector).then(($select) => {
    const ionSelect = $select[0] as HTMLIonSelectElement & { value: string };
    ionSelect.value = value;
    ionSelect.dispatchEvent(
      new CustomEvent('ionChange', {
        bubbles: true,
        composed: true,
        detail: { value },
      })
    );
  });
}

export function clickIonButton(label: string): Cypress.Chainable<any> {
  return cy.contains('ion-button', label).click({ force: true });
}

export function openAccordion(label: string): Cypress.Chainable<any> {
  return cy.contains('ion-item', label).click({ force: true });
}

export function getToastMessage() {
  return cy.get('ion-toast').shadow().find('.toast-message');
}
