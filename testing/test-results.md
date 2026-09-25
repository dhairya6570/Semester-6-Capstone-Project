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