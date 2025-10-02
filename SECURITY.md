# Security Guidelines

## Security Improvements Implemented

### Backend Security

1. **JWT Token Security**
   - JWT secret key now supports environment variables
   - Added issuer claim to JWT tokens
   - Token expiration set to 1 hour
   - Proper token validation with error handling

2. **Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: enabled
   - Strict-Transport-Security (HSTS)
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy

3. **CORS Configuration**
   - Restricted to specific frontend origin
   - Limited allowed headers
   - Credentials support enabled
   - Max age caching for preflight requests

4. **Input Validation**
   - Email validation with regex
   - Phone number validation
   - Username validation
   - Input sanitization to prevent XSS
   - Price and quantity validation

5. **Error Handling**
   - Stack traces hidden in production
   - Generic error messages to prevent information leakage
   - Proper HTTP status codes

6. **Password Security**
   - BCrypt with strength 12
   - Passwords never exposed in responses

### Frontend Security

1. **Token Management**
   - Tokens stored in localStorage (consider httpOnly cookies for production)
   - Automatic logout on token expiration
   - No token refresh to prevent security issues

2. **Input Sanitization**
   - XSS prevention in user inputs
   - Validation before API calls

## Production Deployment Checklist

### Environment Variables (Required)

1. **Backend (.env)**
   ```
   DATABASE_URL=jdbc:postgresql://your-db-host:5432/ShoppingSystemDB
   DATABASE_USERNAME=your_db_user
   DATABASE_PASSWORD=strong_password_here
   JWT_SECRET_KEY=generate_256_bit_secret_key
   FRONTEND_URL=https://your-frontend-domain.com
   SPRING_PROFILE=prod
   ```

2. **Frontend (.env)**
   ```
   VITE_API_URL=https://your-api-domain.com
   ```

### Security Best Practices

1. **Database**
   - Use strong passwords
   - Enable SSL/TLS connections
   - Regular backups
   - Limit database user permissions

2. **JWT Secret**
   - Generate using: `openssl rand -base64 64`
   - Never commit to version control
   - Rotate periodically

3. **HTTPS**
   - Use SSL/TLS certificates
   - Redirect HTTP to HTTPS
   - Enable HSTS

4. **Rate Limiting**
   - Implement API rate limiting
   - Add login attempt limits
   - Consider using Spring Security rate limiting

5. **Monitoring**
   - Enable security logging
   - Monitor failed login attempts
   - Set up alerts for suspicious activity

6. **Dependencies**
   - Regularly update dependencies
   - Scan for vulnerabilities
   - Use dependency check tools

### Additional Recommendations

1. **Session Management**
   - Consider implementing refresh tokens
   - Add token blacklisting for logout
   - Implement session timeout

2. **API Security**
   - Add request size limits
   - Implement API versioning
   - Add request validation middleware

3. **File Upload**
   - Validate file types
   - Scan for malware
   - Limit file sizes (currently 10MB)

4. **Database**
   - Use parameterized queries (already using JPA)
   - Enable query logging in development only
   - Regular security audits

## Security Testing

Before production deployment:

1. Run security scans (OWASP ZAP, Burp Suite)
2. Test authentication and authorization
3. Verify CORS configuration
4. Test input validation
5. Check for SQL injection vulnerabilities
6. Test XSS prevention
7. Verify CSRF protection
8. Test rate limiting
9. Check error handling
10. Verify secure headers

## Incident Response

If a security breach occurs:

1. Immediately rotate JWT secret keys
2. Force logout all users
3. Review access logs
4. Patch vulnerabilities
5. Notify affected users
6. Document the incident

## Contact

For security concerns, contact: [your-security-email@domain.com]
