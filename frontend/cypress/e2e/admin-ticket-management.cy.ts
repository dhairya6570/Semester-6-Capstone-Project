describe("Administrator Ticket Management", () => {
  it("UI-05 - administrator views tickets submitted by employees", () => {
    const ticketTitle = `Cypress UI-05 Employee Ticket ${Date.now()}`;

    // Log in as an employee.
    cy.visit("/login");

    cy.get("#email").type("employee@test.com");

    cy.env(["employeePassword"]).then(({ employeePassword }) => {
      cy.get("#password").type(employeePassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/dashboard");

    // Create a ticket owned by the employee.
    cy.visit("/tickets/new");

    cy.get("#title").type(ticketTitle);

    cy.get("#description").type(
      "Employee support ticket created for the Cypress UI-05 administrator test."
    );

    cy.get("#category").select("Hardware Issue");
    cy.get("#priority").select("Medium");

    cy.contains("button", "Create Ticket").click();

    cy.url().should("match", /\/tickets\/\d+$/);

    // Log out of the employee account.
    cy.visit("/login");

    cy.contains("button", "Log Out").click();

    cy.contains("Logout successful.").should("be.visible");

    // Log in as an administrator.
    cy.get("#email").clear().type("admin@test.com");

    cy.env(["adminPassword"]).then(({ adminPassword }) => {
      cy.get("#password").clear().type(adminPassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/admin");

    // Verify the administrator can see the employee's ticket.
    cy.visit("/admin/tickets");

    cy.contains("h1", "Support Tickets").should("be.visible");

    cy.contains("tr", ticketTitle)
      .should("be.visible")
      .within(() => {
        cy.contains(ticketTitle).should("be.visible");
        cy.contains("Hardware Issue").should("be.visible");
        cy.contains("Medium").should("be.visible");
        cy.contains("Open").should("be.visible");
      });
  });

  it("UI-06 - administrator updates ticket status to Resolved", () => {
    const ticketTitle = `Cypress UI-06 Status Ticket ${Date.now()}`;

    // Log in as an employee.
    cy.visit("/login");

    cy.get("#email").type("employee@test.com");

    cy.env(["employeePassword"]).then(({ employeePassword }) => {
      cy.get("#password").type(employeePassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/dashboard");

    // Create a new ticket for the status update test.
    cy.visit("/tickets/new");

    cy.get("#title").type(ticketTitle);

    cy.get("#description").type(
      "Employee support ticket created for the Cypress UI-06 status update test."
    );

    cy.get("#category").select("Software Issue");
    cy.get("#priority").select("High");

    cy.contains("button", "Create Ticket").click();

    cy.url()
      .should("match", /\/tickets\/\d+$/)
      .then((url) => {
        const ticketId = url.split("/").pop();

        expect(ticketId).to.match(/^\d+$/);

        // Log out of the employee account.
        cy.visit("/login");

        cy.contains("button", "Log Out").click();

        cy.contains("Logout successful.").should("be.visible");

        // Log in as an administrator.
        cy.get("#email").clear().type("admin@test.com");

        cy.env(["adminPassword"]).then(({ adminPassword }) => {
          cy.get("#password").clear().type(adminPassword, { log: false });
        });

        cy.contains("button", "Sign In").click();

        cy.url().should("include", "/admin");

        // Open the employee's ticket as the administrator.
        cy.visit(`/admin/tickets/${ticketId}`);

        cy.contains("h1", ticketTitle).should("be.visible");

        // Change the ticket status to Resolved.
        cy.get("#ticket-status").select("Resolved");

        cy.contains("button", "Save Status").click();

        cy.contains("Ticket status updated successfully.").should(
          "be.visible"
        );

        // Verify the displayed ticket status was updated.
        cy.contains("dt", "Status")
          .parent()
          .should("contain.text", "Resolved");

        cy.get("#ticket-status").should("have.value", "Resolved");
      });
  });
});