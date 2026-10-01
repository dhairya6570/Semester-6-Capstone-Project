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

  it("UI-04 - employee views full ticket detail", () => {
    const ticketTitle = `Cypress UI-04 Ticket ${Date.now()}`;
    const ticketDescription =
      "Support ticket created for the Cypress UI-04 detail test.";

    cy.visit("/login");

    cy.get("#email").type("employee@test.com");

    cy.env(["employeePassword"]).then(({ employeePassword }) => {
      cy.get("#password").type(employeePassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/dashboard");

    cy.visit("/tickets/new");

    cy.get("#title").type(ticketTitle);
    cy.get("#description").type(ticketDescription);
    cy.get("#category").select("Software Issue");
    cy.get("#priority").select("High");

    cy.contains("button", "Create Ticket").click();

    cy.url().should("match", /\/tickets\/\d+$/);

    cy.visit("/tickets");

    cy.contains("a", ticketTitle)
      .should("be.visible")
      .click();

    cy.url().should("match", /\/tickets\/\d+$/);

    cy.contains("h1", ticketTitle).should("be.visible");

    cy.contains("Status")
      .parent()
      .should("contain.text", "Open");

    cy.contains("Priority")
      .parent()
      .should("contain.text", "High");

    cy.contains("Category")
      .parent()
      .should("contain.text", "Software Issue");

    cy.contains("Created").should("be.visible");
    cy.contains("Last Updated").should("be.visible");

    cy.contains("Description")
      .parent()
      .should("contain.text", ticketDescription);
  });
});