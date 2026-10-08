# Week 5 — OWASP ZAP Security Testing

## Purpose

Perform initial security testing for the IT Asset & Support Ticket Management Website.

- SEC-01: SQL Injection
- SEC-02: Cross-Site Scripting (XSS)

## Test Environment

- Tool: OWASP ZAP 2.17.0
- Backend: http://localhost:3001
- Endpoint: POST /api/tickets/28/notes
- Authentication: Administrator session
- Test data: Disposable ticket #28 (deleted after testing)
- Scan policy: Capstone-SEC01-SEC02

## Active Scan Results

- Scan ID: 0
- Scan status: Finished (100%)
- Total HTTP requests: 32
- POST requests containing noteText: 31
- HTTP 201 responses: 31
- HTTP 404 responses: 1
- Security alerts: 0

### SQL Injection — SEC-01

| Scanner | Rule ID | Requests | Alerts |
| --- | --- | --- | --- |
| SQL Injection | 40018 | 22 | 0 |
| SQL Injection - PostgreSQL (Time Based) | 40022 | 5 | 0 |

Result: PASS within the tested endpoint and scan configuration. No SQL injection alerts were reported.

### Cross-Site Scripting — SEC-02

| Scanner | Rule ID | Requests | Alerts |
| --- | --- | --- | --- |
| Cross Site Scripting (Reflected) | 40012 | 2 | 0 |
| Cross Site Scripting (Persistent) - Prime | 40016 | 1 | 0 |
| Cross Site Scripting (Persistent) - Spider | 40017 | 1 | 0 |
| Cross Site Scripting (Persistent) | 40014 | 0 | 0 |

Result: PASS within the tested endpoint and scan configuration. No XSS alerts were reported.

## Limitations

This was an initial targeted security scan, not a complete application penetration test.

The persistent XSS rule (40014) completed without sending any requests. Therefore, this scan does not establish comprehensive stored-XSS coverage or prove that every application endpoint is secure.

## Cleanup

- Disposable ticket #28 deleted.
- Backend GET verification returned HTTP 404.
- Temporary administrator session logged out successfully (HTTP 200).
- Temporary authentication cookie file removed.
- Generated ZAP runtime files and HTML report excluded from Git.

## Report

Local HTML report:

backend/security/reports/week5-zap-security-report.html

The report is retained locally and excluded from Git because it may contain application request and response information.
