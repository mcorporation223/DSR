import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

/**
 * Password validation rules
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - Numbers are optional (flexible requirements)
 */
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Minimum length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a secure setup token
 */
export const generateSetupToken = (): string => {
  return randomBytes(32).toString("hex");
};

/**
 * Generate setup token expiry time (24 hours from now)
 */
export const generateSetupTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours from now
  return expiry;
};

/**
 * Check if a setup token is valid (exists and not expired)
 */
export const isSetupTokenValid = (tokenExpiry: Date | null): boolean => {
  if (!tokenExpiry) return false;
  return new Date() < tokenExpiry;
};

/**
 * Generate a complete setup token data object
 */
export const generateSetupTokenData = () => {
  return {
    setupToken: generateSetupToken(),
    setupTokenExpiry: generateSetupTokenExpiry(),
  };
};
