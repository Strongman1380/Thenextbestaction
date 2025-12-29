/**
 * Enhanced input sanitization utilities for security
 */

/**
 * Sanitize text input to prevent XSS and prompt injection
 */
export function sanitizeTextInput(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters/sequences
  let sanitized = input
    // Remove code block markers that could be used for prompt injection
    .replace(/```/g, "")
    // Remove template literal markers
    .replace(/\$\{/g, "")
    // Remove potential script tags (case insensitive)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove other potentially dangerous tags
    .replace(/<(iframe|object|embed|form|input|textarea|button)[^>]*>.*?<\/\1>/gi, "")
    // Remove javascript: and data: URIs in case they're in attributes
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    // Remove potential eval() calls
    .replace(/\beval\s*\(/gi, "")
    .replace(/\bFunction\s*\(/gi, "")
    // Remove newlines that might be used for prompt injection
    .replace(/\n{3,}/g, "\n\n")
    // Trim excessive whitespace
    .replace(/\s{4,}/g, "   ")
    // Limit length
    .substring(0, maxLength)
    .trim();

  return sanitized;
}

/**
 * Sanitize user-provided URLs to prevent open redirect vulnerabilities
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  try {
    // Only allow http and https URLs
    if (input.startsWith("http://") || input.startsWith("https://")) {
      const url = new URL(input);
      // Only return the URL if it's properly formatted
      return url.toString();
    }
    // If it doesn't start with http/https, it's likely a relative path which is acceptable
    if (input.startsWith("/") || input.startsWith("./") || input.startsWith("../")) {
      return input;
    }
    // For other cases, return empty string
    return "";
  } catch (e) {
    // If URL parsing fails, return empty string
    return "";
  }
}

/**
 * Sanitize user input for AI prompts specifically
 */
export function sanitizeForAI(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove potential prompt injection attempts
  let sanitized = input
    // Remove attempts to change AI behavior
    .replace(/(?<!\w)ignore(ing)?\s+(the\s+)?(above|below|instructions|previous|following)(?!\w)/gi, "")
    .replace(/(?<!\w)disregard(ing)?\s+(the\s+)?(above|below|instructions|previous|following)(?!\w)/gi, "")
    .replace(/(?<!\w)override(ing)?\s+(the\s+)?(above|below|instructions|previous|following)(?!\w)/gi, "")
    .replace(/(?<!\w)forget(ing)?\s+(the\s+)?(above|below|instructions|previous|following)(?!\w)/gi, "")
    // Remove system prompt attempts
    .replace(/(?<!\w)system\s+prompt(?!\w)/gi, "")
    .replace(/(?<!\w)you\s+are(?!\w)/gi, "")
    // Remove potential role playing attempts
    .replace(/(?<!\w)act\s+as(?!\w)/gi, "")
    .replace(/(?<!\w)pretend\s+you\s+are(?!\w)/gi, "")
    // Limit length to prevent prompt flooding
    .substring(0, 3000)
    .trim();

  return sanitized;
}

/**
 * Validate and sanitize ZIP code
 */
export function sanitizeZipCode(input: string): string | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Remove any non-digit characters
  const digitsOnly = input.replace(/\D/g, "");

  // Check if it's a valid 5-digit ZIP or 9-digit ZIP+4
  if (digitsOnly.length === 5 || digitsOnly.length === 9) {
    return digitsOnly;
  }

  return null;
}

/**
 * Sanitize urgency level
 */
export function sanitizeUrgency(input: string): "low" | "medium" | "high" | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const normalized = input.toLowerCase().trim();
  
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized as "low" | "medium" | "high";
  }

  return null;
}

/**
 * Sanitize resource type
 */
export function sanitizeResourceType(input: string): "worksheet" | "reading" | "exercise" | "any" | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const normalized = input.toLowerCase().trim();
  
  if (normalized === "worksheet" || normalized === "reading" || normalized === "exercise" || normalized === "any") {
    return normalized as "worksheet" | "reading" | "exercise" | "any";
  }

  return null;
}

/**
 * Validate client identifier for rate limiting
 */
export function validateClientIdentifier(identifier: string): string {
  if (!identifier || typeof identifier !== "string") {
    return "anonymous";
  }

  // Only allow alphanumeric characters, dots, hyphens, and colons
  // This covers IPv4, IPv6, and standard identifiers
  const sanitized = identifier.replace(/[^a-zA-Z0-9.:_-]/g, "").substring(0, 100);

  return sanitized || "anonymous";
}

/**
 * Sanitize initials (2-5 characters, uppercase, alphanumeric)
 */
export function sanitizeInitials(input: string): string | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Remove any non-alphanumeric characters and limit to 5 characters
  const sanitized = input.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toUpperCase();

  // Must be at least 2 characters
  return sanitized.length >= 2 ? sanitized : null;
}
