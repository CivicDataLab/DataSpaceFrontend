# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of DataSpace Frontend seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:
- **Email**: tech@civicdatalab.in
- **Subject**: [SECURITY] DataSpace Frontend - Brief Description

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, CSRF, authentication bypass, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Assessment**: Our security team will investigate and assess the vulnerability
3. **Updates**: We will keep you informed about the progress of fixing the vulnerability
4. **Resolution**: Once fixed, we will notify you and publicly disclose the vulnerability (with credit to you, if desired)

## Security Best Practices

### For Contributors

When contributing to this project, please follow these security guidelines:

#### Authentication & Authorization
- Never commit credentials, API keys, or secrets to the repository
- Use environment variables for all sensitive configuration
- Always validate and sanitize user inputs
- Implement proper session management
- Use secure cookie settings (httpOnly, secure, sameSite)

#### Data Protection
- Encrypt sensitive data in transit (HTTPS only)
- Never log sensitive information (passwords, tokens, PII)
- Implement proper CORS policies
- Use Content Security Policy (CSP) headers

#### Dependencies
- Regularly update dependencies to patch known vulnerabilities
- Run `npm audit` before submitting pull requests
- Review security advisories for critical dependencies
- Use exact versions in package.json for production dependencies

#### Code Quality
- Follow secure coding practices
- Avoid using `dangerouslySetInnerHTML` without proper sanitization
- Validate all GraphQL queries and mutations
- Implement rate limiting for API calls
- Use TypeScript strict mode for type safety

#### Frontend Security
- Sanitize all user-generated content before rendering
- Implement proper XSS protection
- Use trusted types for DOM manipulation
- Validate all external data sources
- Implement proper error handling without exposing sensitive information

### For Deployment

#### Environment Configuration
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Configure Keycloak with proper security settings
- Enable HTTPS in production
- Set appropriate CORS origins
- Configure proper CSP headers

#### Monitoring & Logging
- Enable Sentry error tracking in production
- Monitor for suspicious activity
- Implement proper logging (without sensitive data)
- Set up alerts for security events
- Use Google Analytics responsibly with user privacy in mind

#### Infrastructure
- Keep Node.js and npm updated
- Use security headers (HSTS, X-Frame-Options, etc.)
- Implement rate limiting at the infrastructure level
- Regular security audits and penetration testing
- Backup data regularly

## Known Security Considerations

### Authentication Flow
- This application uses Keycloak for authentication
- Tokens are stored securely using NextAuth.js
- Session management follows OWASP guidelines
- Refresh tokens are handled securely

### Third-Party Integrations
- **Keycloak**: Ensure proper configuration and regular updates
- **Sentry**: Configure to exclude sensitive data from error reports
- **Google Analytics**: Implement with privacy considerations
- **GraphQL Backend**: Validate all responses and handle errors securely

### Data Handling
- User data is encrypted in transit
- Sensitive operations require authentication
- File uploads are validated and sanitized
- Rich text content is sanitized before rendering

## Security Checklist for Pull Requests

Before submitting a PR, ensure:

- [ ] No hardcoded secrets or credentials
- [ ] All user inputs are validated and sanitized
- [ ] Dependencies are up to date (`npm audit` passes)
- [ ] Authentication checks are in place for protected routes
- [ ] Error messages don't expose sensitive information
- [ ] CORS and CSP policies are properly configured
- [ ] TypeScript types are properly defined
- [ ] Security-related changes are documented

## Vulnerability Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Prominently announce the issue in release notes

## Security Updates

Security updates will be released as patch versions (e.g., 0.1.4) and will be clearly marked in the CHANGELOG.md file.

Subscribe to our GitHub releases to stay informed about security updates.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [React Security Best Practices](https://react.dev/learn/security)
- [Keycloak Security Documentation](https://www.keycloak.org/docs/latest/securing_apps/)

## Contact

For any security-related questions or concerns, please contact:
- **Email**: tech@civicdatalab.in
- **GitHub**: [CivicDataLab/DataSpaceFrontend](https://github.com/CivicDataLab/DataSpaceFrontend)

---

Last Updated: October 2025
