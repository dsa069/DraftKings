describe('Client Detail Navigation E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8100/#/tabs/players');
  });

  it('should navigate to my-team', () => {
    // Click on the my-team button
    cy.get('ion-tab-button').eq(0).click();

    // Should navigate to my-team
    cy.url().should('include', '/tabs/my-team');
  });
});
