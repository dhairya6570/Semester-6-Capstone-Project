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