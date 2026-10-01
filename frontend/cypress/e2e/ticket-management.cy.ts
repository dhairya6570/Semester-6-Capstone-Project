describe("Employee Ticket Management", () => {
  it("UI-03 - employee submits a new support ticket", () => {
    const ticketTitle = `Cypress UI-03 Ticket ${Date.now()}`;

    cy.visit("/login");

    cy.get("#email").type("employee@test.com");
    cy.env(["employeePassword"]).then(({ employeePassword }) => {
        cy.get("#password").type(employeePassword, { log: false });
    });
    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/dashboard");

    cy.visit("/tickets/new");

    cy.get("#title").type(ticketTitle);

    cy.get("#description").type(
      "Support ticket created by the Cypress UI-03 automated test."
    );

    cy.get("#category").select("Hardware Issue");

    cy.contains("button", "Create Ticket").click();

    cy.url().should("match", /\/tickets\/\d+$/);

    cy.visit("/tickets");

    cy.contains("tr", ticketTitle)
      .should("be.visible")
      .within(() => {
        cy.contains(ticketTitle).should("be.visible");
        cy.contains("Hardware Issue").should("be.visible");
        cy.contains("Open").should("be.visible");
      });
  });
});