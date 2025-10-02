// Security Configuration
export const SECURITY_CONFIG = {
  // Input validation patterns
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]+$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },

  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", import.meta.env.VITE_API_URL || 'http://localhost:8080']
  },

  // Rate limiting
  rateLimits: {
    login: { attempts: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    api: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    upload: { files: 10, window: 60 * 1000 } // 10 files per minute
  },

  // Session configuration
  session: {
    timeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000, // 1 hour
    renewThreshold: 300000, // 5 minutes before expiry
    maxConcurrent: 3 // Maximum concurrent sessions
  }
};

// Input sanitization
export const sanitizeInput = (input, type = 'text') => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  let sanitized = input.replace(/[<>\"'&]/g, '');
  
  switch (type) {
    case 'email':
      sanitized = sanitized.toLowerCase().trim();
      break;
    case 'phone':
      sanitized = sanitized.replace(/[^\d+\-\s()]/g, '');
      break;
    case 'username':
      sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
      break;
    default:
      sanitized = sanitized.trim();
  }
  
  return sanitized;
};

// Validate input against patterns
export const validateInput = (input, type) => {
  const pattern = SECURITY_CONFIG.patterns[type];
  return pattern ? pattern.test(input) : true;
};

// Rate limiting tracker
class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  isAllowed(key, limit) {
    const now = Date.now();
    const windowStart = now - limit.window;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const userAttempts = this.attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => time > windowStart);
    this.attempts.set(key, validAttempts);
    
    // Check if under limit
    if (validAttempts.length < limit.attempts) {
      validAttempts.push(now);
      return true;
    }
    
    return false;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();