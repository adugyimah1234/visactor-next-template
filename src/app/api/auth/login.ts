import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AuthenticationError } from '@/lib/api/errors';
import { logRequest, rateLimit, validateRequest, withMiddleware } from '@/lib/api/middleware';
import { errorResponse, successResponse } from '@/lib/api/response';
import { ApiResponse, HttpStatus } from '@/lib/api/types';

/**
 * Types for login request and response
 */
export interface LoginRequestData {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  expiresAt: string;
}

/**
 * Validation schema for login request
 */
const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

/**
 * Rate limit configuration for login attempts
 * More restrictive than standard endpoints to prevent brute force attacks
 */
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 requests per IP per 15 minutes
  keyGenerator: (req) => {
    // Use IP address and email (if available) for more granular rate limiting
    try {
      const body = req.body as ReadableStream;
      if (body) {
        // Create a copy of the request to read the body without consuming it
        const clonedReq = req.clone();
        const text = clonedReq.text();
        const json = JSON.parse(text);
        if (json.email) {
          return `${req.ip}-${json.email}`;
        }
      }
    } catch (error) {
      // If error reading body, fall back to IP-only rate limiting
      console.error('Error reading request body for rate limiting:', error);
    }
    return req.ip || 'unknown';
  },
});

/**
 * Mock authentication function
 * In a real application, this would verify credentials against a database
 */
async function authenticateUser(email: string, password: string): Promise<LoginResponseData> {
  // This is a mock implementation - in a real application, you would:
  // 1. Verify the credentials against a database
  // 2. Generate a JWT token
  // 3. Return user information and token
  
  // For demonstration purposes only
  if (email === 'admin@example.com' && password === 'password123') {
    return {
      user: {
        id: '123456',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
      token: 'mock-jwt-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };
  }
  
  // If credentials don't match, throw an authentication error
  throw new AuthenticationError('Invalid email or password');
}

/**
 * Login handler function
 * Process the login request and return appropriate response
 */
async function loginHandler(
  req: NextRequest,
  context: { data: LoginRequestData }
): Promise<NextResponse<ApiResponse<LoginResponseData>>> {
  try {
    // Extract validated data from context (added by validation middleware)
    const { email, password } = context.data;
    
    // Authenticate user (throws error if authentication fails)
    const authResult = await authenticateUser(email, password);
    
    // Return successful response with user data and token
    return successResponse<LoginResponseData>(
      authResult, 
      { timestamp: new Date().toISOString() },
      HttpStatus.OK
    );
  } catch (error) {
    // Let the error handling middleware take care of errors
    throw error;
  }
}

/**
 * POST handler for login requests
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return withMiddleware<LoginResponseData>(
    loginHandler,
    [
      logRequest(), // Log the request
      loginRateLimit, // Apply rate limiting
      validateRequest<LoginRequestData>(loginSchema), // Validate request body
    ]
  )(req, {});
}
