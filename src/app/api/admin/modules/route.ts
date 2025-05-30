import { NextRequest, NextResponse } from 'next/server';

import { UserRole } from '@/lib/api/auth';
import { requireAuth, requireRole } from '@/lib/api/auth';
import { NotFoundError, ValidationError } from '@/lib/api/errors';
import { 
  logRequest, 
  rateLimit, 
  validateRequest, 
  withMiddleware 
} from '@/lib/api/middleware';
import { errorResponse, successResponse } from '@/lib/api/response';
import { ApiResponse, HttpStatus } from '@/lib/api/types';
import { 
  availableModules, 
  Module, 
  getAllModulesForRoleSchema 
} from '@/types/module';

/**
 * Rate limit configuration for admin API
 */
const adminApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

/**
 * GET handler for retrieving all modules
 */
async function getModulesHandler(
  req: NextRequest,
  context: any
): Promise<NextResponse<ApiResponse<Module[]>>> {
  try {
    // Check if role filter is provided
    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    
    if (role) {
      // Validate role parameter
      const validationResult = getAllModulesForRoleSchema.safeParse({ role });
      
      if (!validationResult.success) {
        return errorResponse(
          new ValidationError('Invalid role parameter'),
          HttpStatus.BAD_REQUEST
        );
      }
      
      // Return all modules with default access for the specified role
      return successResponse<Module[]>(
        availableModules,
        { 
          timestamp: new Date().toISOString(),
          requestId: context.requestId
        },
        HttpStatus.OK
      );
    }
    
    // Return all modules
    return successResponse<Module[]>(
      availableModules,
      { 
        timestamp: new Date().toISOString(),
        requestId: context.requestId
      },
      HttpStatus.OK
    );
  } catch (error) {
    // Let the error handling middleware take care of errors
    throw error;
  }
}

/**
 * GET endpoint for retrieving all modules
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return withMiddleware<Module[]>(
    getModulesHandler,
    [
      logRequest({ logLevel: 'info' }), // Log the request
      adminApiRateLimit, // Apply rate limiting
      requireAuth(), // Check if user is authenticated
      requireRole([UserRole.ADMIN]), // Check if user has admin role
    ]
  )(req, {});
}

