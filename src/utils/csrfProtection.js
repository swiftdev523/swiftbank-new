// CSRF protection utility for banking application
export class CSRFProtection {
  constructor() {
    this.tokenKey = "csrf_token";
    this.tokenHeaderName = "X-CSRF-Token";
    this.tokenExpiry = 60 * 60 * 1000; // 1 hour
    this.currentToken = null;
    this.tokenGeneratedAt = null;
  }

  // Generate a secure CSRF token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");

    this.currentToken = token;
    this.tokenGeneratedAt = Date.now();

    // Store in sessionStorage (not localStorage for security)
    sessionStorage.setItem(
      this.tokenKey,
      JSON.stringify({
        token,
        generatedAt: this.tokenGeneratedAt,
      })
    );

    return token;
  }

  // Get current CSRF token
  getToken() {
    // Check if current token is still valid
    if (this.currentToken && this.isTokenValid()) {
      return this.currentToken;
    }

    // Try to get from sessionStorage
    try {
      const stored = sessionStorage.getItem(this.tokenKey);
      if (stored) {
        const { token, generatedAt } = JSON.parse(stored);

        // Check if stored token is still valid
        if (Date.now() - generatedAt < this.tokenExpiry) {
          this.currentToken = token;
          this.tokenGeneratedAt = generatedAt;
          return token;
        }
      }
    } catch (error) {
      console.warn("Failed to retrieve CSRF token from storage:", error);
    }

    // Generate new token if none exists or expired
    return this.generateToken();
  }

  // Check if current token is valid
  isTokenValid() {
    return (
      this.currentToken &&
      this.tokenGeneratedAt &&
      Date.now() - this.tokenGeneratedAt < this.tokenExpiry
    );
  }

  // Refresh token (generate new one)
  refreshToken() {
    this.currentToken = null;
    this.tokenGeneratedAt = null;
    sessionStorage.removeItem(this.tokenKey);
    return this.generateToken();
  }

  // Add CSRF token to request headers
  addTokenToHeaders(headers = {}) {
    const token = this.getToken();
    return {
      ...headers,
      [this.tokenHeaderName]: token,
    };
  }

  // Add CSRF token to form data
  addTokenToFormData(formData) {
    const token = this.getToken();

    if (formData instanceof FormData) {
      formData.append("_csrf", token);
    } else if (typeof formData === "object") {
      formData._csrf = token;
    }

    return formData;
  }

  // Validate CSRF token (client-side validation)
  validateToken(receivedToken) {
    const currentToken = this.getToken();
    return receivedToken === currentToken && this.isTokenValid();
  }

  // Clear token (logout)
  clearToken() {
    this.currentToken = null;
    this.tokenGeneratedAt = null;
    sessionStorage.removeItem(this.tokenKey);
  }

  // Get token info for debugging
  getTokenInfo() {
    return {
      hasToken: !!this.currentToken,
      isValid: this.isTokenValid(),
      generatedAt: this.tokenGeneratedAt,
      expiresAt: this.tokenGeneratedAt
        ? this.tokenGeneratedAt + this.tokenExpiry
        : null,
      timeRemaining: this.isTokenValid()
        ? this.tokenExpiry - (Date.now() - this.tokenGeneratedAt)
        : 0,
    };
  }
}

// Enhanced fetch wrapper with CSRF protection
export class SecureFetch {
  constructor(csrfProtection) {
    this.csrf = csrfProtection;
    this.rateLimiter = new Map();
    this.requestCounts = new Map();
  }

  // Rate limiting check
  checkRateLimit(endpoint, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const key = endpoint;

    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, { count: 1, windowStart: now });
      return true;
    }

    const data = this.rateLimiter.get(key);

    // Reset window if expired
    if (now - data.windowStart > windowMs) {
      this.rateLimiter.set(key, { count: 1, windowStart: now });
      return true;
    }

    // Check if within limit
    if (data.count < maxRequests) {
      data.count++;
      return true;
    }

    return false;
  }

  // Secure fetch with CSRF protection and rate limiting
  async fetch(url, options = {}) {
    // Rate limiting check
    const endpoint = new URL(url, window.location.origin).pathname;
    if (!this.checkRateLimit(endpoint)) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // Add CSRF token to headers
    const headers = this.csrf.addTokenToHeaders(options.headers);

    // Add additional security headers
    const secureHeaders = {
      ...headers,
      "X-Requested-With": "XMLHttpRequest",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    };

    // Handle form data
    let body = options.body;
    if (
      body &&
      (options.method === "POST" ||
        options.method === "PUT" ||
        options.method === "PATCH")
    ) {
      if (typeof body === "object" && !(body instanceof FormData)) {
        body = this.csrf.addTokenToFormData(body);
        body = JSON.stringify(body);
        secureHeaders["Content-Type"] = "application/json";
      } else if (body instanceof FormData) {
        body = this.csrf.addTokenToFormData(body);
      }
    }

    const secureOptions = {
      ...options,
      headers: secureHeaders,
      body,
      credentials: "same-origin", // Important for CSRF protection
      mode: "cors",
    };

    try {
      const response = await fetch(url, secureOptions);

      // Handle CSRF token refresh if server sends new token
      const newToken = response.headers.get("X-New-CSRF-Token");
      if (newToken) {
        this.csrf.currentToken = newToken;
        this.csrf.tokenGeneratedAt = Date.now();
        sessionStorage.setItem(
          this.csrf.tokenKey,
          JSON.stringify({
            token: newToken,
            generatedAt: this.csrf.tokenGeneratedAt,
          })
        );
      }

      // Handle 403 CSRF errors
      if (response.status === 403) {
        const errorText = await response.text();
        if (errorText.includes("CSRF") || errorText.includes("csrf")) {
          // Refresh token and retry once
          this.csrf.refreshToken();
          return this.fetch(url, options);
        }
      }

      return response;
    } catch (error) {
      // Log security-related errors
      if (error.message.includes("CSRF") || error.message.includes("403")) {
        console.error("Security error:", error);
      }
      throw error;
    }
  }

  // Clear rate limiting data
  clearRateLimits() {
    this.rateLimiter.clear();
  }

  // Get rate limiting status
  getRateLimitStatus(endpoint) {
    const data = this.rateLimiter.get(endpoint);
    if (!data) return { requests: 0, remaining: 10, resetTime: null };

    const now = Date.now();
    const isExpired = now - data.windowStart > 60000;

    return {
      requests: isExpired ? 0 : data.count,
      remaining: isExpired ? 10 : Math.max(0, 10 - data.count),
      resetTime: isExpired ? null : new Date(data.windowStart + 60000),
    };
  }
}

// Global instances
export const csrfProtection = new CSRFProtection();
export const secureFetch = new SecureFetch(csrfProtection);

// React hook for CSRF protection
import { useState, useEffect } from "react";

export function useCSRF() {
  const [tokenInfo, setTokenInfo] = useState(csrfProtection.getTokenInfo());

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenInfo(csrfProtection.getTokenInfo());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshToken = () => {
    const newToken = csrfProtection.refreshToken();
    setTokenInfo(csrfProtection.getTokenInfo());
    return newToken;
  };

  return {
    ...tokenInfo,
    token: csrfProtection.getToken(),
    refreshToken,
    addTokenToHeaders: (headers) => csrfProtection.addTokenToHeaders(headers),
    addTokenToFormData: (formData) =>
      csrfProtection.addTokenToFormData(formData),
  };
}

// Secure form wrapper hook
export function useSecureForm(onSubmit, options = {}) {
  const csrf = useCSRF();

  const handleSubmit = async (formData) => {
    try {
      // Add CSRF token to form data
      const secureFormData = csrf.addTokenToFormData(formData);

      // Call original submit handler
      return await onSubmit(secureFormData);
    } catch (error) {
      // Handle CSRF errors
      if (error.message.includes("CSRF") || error.message.includes("403")) {
        // Refresh token and retry once
        csrf.refreshToken();
        const retryFormData = csrf.addTokenToFormData(formData);
        return await onSubmit(retryFormData);
      }
      throw error;
    }
  };

  return {
    handleSubmit,
    csrf,
    isTokenValid: csrf.isValid,
  };
}

export default { csrfProtection, secureFetch, CSRFProtection, SecureFetch };
