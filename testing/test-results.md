# Automated Test Results

This file records automated testing completed for the IT Asset & Support Ticket Management System.

## Week 2 - Authentication

### Jest Unit Tests

Command:

`cd backend && npm test`

Results:

- Test Suites: 2 passed, 2 total
- Tests: 6 passed, 6 total
- Failures: 0

Milestone 4 tests completed:

- UT-01 - Valid password complexity: PASS
- UT-02 - Missing special character: PASS
- UT-03 - Password shorter than 8 characters: PASS

### Postman API Tests

Command:

`postman collection run postman/authentication.postman_collection.json`

Results:

- Requests: 3 executed, 0 failed
- Test Scripts: 3 executed, 0 failed
- Assertions: 7 executed, 0 failed

Milestone 4 tests completed:

- API-01 - Valid employee login (HTTP 200): PASS
- API-02 - Invalid password (HTTP 401): PASS
- API-03 - Missing email (HTTP 400): PASS

### Overall Result

Week 2 automated testing: PASS


## Week 3 - User Management and Profile

### Jest Unit Tests

Command:

`cd backend && npm test`

Results:

- Test Suites: 4 passed, 4 total
- Tests: 9 passed, 9 total
- Failures: 0

Milestone 4 Week 3 tests completed:

- UT-08 - Administrator role validation: PASS
- UT-09 - Employee role validation: PASS
- UT-13 - Incorrect current password rejected: PASS

Regression testing:

- All Week 2 Jest tests continue to pass.

### Postman API Tests

Command:

`postman collection run postman/authentication.postman_collection.json`

Results:

- Requests: 10 executed, 0 failed
- Test Scripts: 10 executed, 0 failed
- Prerequest Scripts: 1 executed, 0 failed
- Assertions: 20 executed, 0 failed

Milestone 4 Week 3 tests completed:

- API-04 - Administrator creates a new user (HTTP 201): PASS
- API-05 - Duplicate email rejected (HTTP 409): PASS
- API-06 - Authenticated user views own profile (HTTP 200): PASS
- API-07 - Authenticated user updates password (HTTP 200): PASS

Regression testing:

- API-01 - Valid employee login: PASS
- API-02 - Invalid password: PASS
- API-03 - Missing email: PASS

### Code Quality Checks

- Backend ESLint: PASS
- Frontend ESLint: PASS

### Overall Result

Week 3 automated testing: PASS


## Week 4 - Support Ticket Management

### Jest Unit Tests

Command:

`cd backend && npm test`

Results:

- Test Suites: 6 passed, 6 total
- Tests: 14 passed, 14 total
- Failures: 0

Milestone 4 Week 4 tests completed:

- UT-04 - Ticket title at exactly 100 characters is valid: PASS
- UT-05 - Ticket title exceeding 100 characters is rejected: PASS
- UT-06 - Ticket description at exactly 1000 characters is valid: PASS
- UT-07 - Ticket description exceeding 1000 characters is rejected: PASS
- UT-10 - New ticket automatically receives Open status: PASS

Regression testing:

- All previous Week 2 and Week 3 Jest tests continue to pass.

### Postman API Tests

Command:

`postman collection run postman/authentication.postman_collection.json`

Results:

- Requests: 11 executed, 0 failed
- Test Scripts: 11 executed, 0 failed
- Prerequest Scripts: 1 executed, 0 failed
- Assertions: 22 executed, 0 failed

Milestone 4 Week 4 tests completed:

- API-08 - Employee creates support ticket (HTTP 201): PASS
- API-08 - Created ticket automatically receives Open status: PASS

Regression testing:

- API-01 through API-07 continue to pass.

### Cypress End-to-End Tests

Command:

`CYPRESS_employeePassword='Test@1234' npx cypress run --spec cypress/e2e/ticket-management.cy.ts`

Results:

- Specs: 1 passed, 1 total
- Tests: 2 passed, 2 total
- Failures: 0

Milestone 4 Week 4 tests completed:

- UI-03 - Employee submits a new support ticket and sees it in the ticket list with Open status: PASS
- UI-04 - Employee opens a ticket from the list and views the full ticket details: PASS

### Code Quality Checks

- Backend ESLint: PASS
- Frontend ESLint: PASS
- Postman collection JSON validation: PASS

### Overall Result

Week 4 automated testing: PASS



## Week 5 - Administrator Ticket Management

### Jest Unit Tests

Command:

`cd backend && npm test`

Results:

- Test Suites: 6 passed, 6 total
- Tests: 18 passed, 18 total
- Failures: 0

Regression testing:

- All previous Week 2, Week 3, and Week 4 Jest tests continue to pass.
- Ticket note validation tests are included in the current test suite.

### Postman API Tests

Command:

`postman collection run postman/authentication.postman_collection.json`

Results:

- Requests: 19 executed, 0 failed
- Assertions: 36 executed, 0 failed

Milestone 4 Week 5 tests completed:

- API-09 - Administrator updates ticket status to Resolved (HTTP 200) and verifies status timestamp: PASS
- API-10 - Administrator adds an internal ticket note (HTTP 201), inaccessible to employees: PASS
- API-11 - Administrator deletes a ticket (HTTP 200) and verifies removal: PASS

Regression testing:

- Previous API tests continue to pass.

### Cypress End-to-End Tests

Command:

`npx cypress run --spec "cypress/e2e/admin-ticket-management.cy.ts" --env employeePassword="Test@1234",adminPassword="Test@123"`

Results:

- Specs: 1 passed, 1 total
- Tests: 3 passed, 3 total
- Failures: 0
- Duration: 15 seconds

Milestone 4 Week 5 tests completed:

- UI-05 - Administrator views tickets submitted by employees: PASS
- UI-06 - Administrator updates ticket status to Resolved: PASS
- UI-07 - Internal ticket notes are visible to administrators but inaccessible to employees: PASS

Testing observation:

- The initial regression run failed all three tests because the Cypress password environment variables were missing.
- After supplying the correct test credentials, all three tests passed.
- No application code changes were required to resolve the test configuration issue.

### OWASP ZAP Security Testing

Tool: OWASP ZAP 2.17.0

Target:

`POST http://localhost:3001/api/tickets/28/notes`

Results:

- Active scan: Finished (100%)
- Total HTTP requests: 32
- POST requests containing noteText: 31
- Successful HTTP 201 responses: 31
- Security alerts: 0

Milestone 4 security tests:

- SEC-01 - SQL Injection: PASS within the tested endpoint and scan configuration.
- SEC-02 - Cross-Site Scripting (XSS): PASS within the tested endpoint and scan configuration.

Security testing limitations:

- This was a targeted initial security scan, not a complete penetration test.
- The persistent XSS rule completed without sending requests, so comprehensive stored-XSS coverage was not established.
- Zero ZAP alerts does not guarantee the absence of vulnerabilities.

Evidence:

- `backend/security/README.md`
- `backend/security/reports/week5-zap-security-report.html`

Cleanup:

- Disposable security test ticket #28 deleted and HTTP 404 verified.
- Temporary administrator session logged out successfully.
- Temporary authentication cookie file removed.

### Code Quality Checks

- Backend ESLint: PASS
- Frontend ESLint: PASS
- Backend Jest regression: PASS
- Cypress Week 5 regression: PASS

### Overall Result

Week 5 automated testing: PASS within the documented test scope.
