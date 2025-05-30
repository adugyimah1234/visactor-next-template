import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { UserRole } from '@/lib/api/auth';
import { requireAuth, requireRole } from '@/lib/api/auth';
import { NotFoundError, ValidationError } from '@/lib/api/errors';
import { 
  logRequest, 
  rateLimit, 
  sanitizeRequestData, 
  validateRequest, 
  withMiddleware 
} from '@/lib/api';
import { errorResponse, notFoundResponse, successResponse } from '@/lib/api/response';
import { ApiResponse, HttpStatus } from '@/lib/api/types';
import { 
  Module,
  UserModuleAccess,
  availableModules,
  defaultModuleAccessByRole,
  findModuleById,
  getAllModuleIds,
  moduleAccessSchema
} from '@/types/module';
import { mockUsers } from '@/app/api/admin/users/route';

// Mock data store for user module access
const userModuleAccessStore: Record<string, Record<string, boolean>> = {};

/**
 * Initialize default module access for a user based on their role
 */
function initializeModuleAccess(userId: string, userRole: UserRole): Record<string, boolean> {
  const defaultModules = defaultModuleAccessByRole[userRole] || [];
  const allModuleIds = getAllModuleIds();
  
  const moduleAccess: Record<string, boolean> = {};
  
  // Set all modules to false by default
  allModuleIds.forEach(moduleId => {
    moduleAccess[moduleId] = false;
  });
  
  // Set default modules for the role to true
  defaultModules.forEach(moduleId => {
    moduleAccess[moduleId] = true;
  });
  
  return moduleAccess;
}

/**
 * Get module access for a user
 */
async function getUserModuleAccess(userId: string): Promise<Record<string, boolean>> {
  // Find the user in the mock data
  const user = mockUsers.find(user => user.id === userId);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  // If the user doesn't have module access yet, initialize default based on role
  if (!userModuleAccessStore[userId]) {
    userModuleAccessStore[userId] = initializeModuleAccess(userId, user.role as UserRole);
  }
  
  return userModuleAccessStore[userId];
}

/**
 * Update module access for a user
 */
async function updateUserModuleAccess(
  userId: string,
  moduleId: string,
  hasAccess: boolean
): Promise<Record<string, boolean>> {
  // Find the user in the mock data
  const user = mockUsers.find(user => user.id === userId);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  // Validate that the module exists
  const module = findModuleById(moduleId);
  if (!module) {
    throw new NotFoundError('Module');
  }
  
  // Get current module access
  let moduleAccess = await getUserModuleAccess(userId);
  
  // Update the access
  moduleAccess = {
    ...moduleAccess,
    [moduleId]: hasAccess
  };
  
  // If it's a parent module and access is being revoked, revoke access to children as well
  if (!hasAccess && module.children && module.children.length > 0) {
    module.children.forEach(child => {
      moduleAccess[child.id] = false;
    });
  }
  
  // If it's a child module and access is being granted, ensure parent has access too
  if (hasAccess) {
    // Find parent module
    for (const parentModule of availableModules) {
      if (parentModule.children && parentModule.children.some(child => child.id === moduleId)) {
        moduleAccess[parentModule.id] = true;
        break;
      }
    }
  }
  
  // Save updated access
  userModuleAccessStore[userId] = moduleAccess;
  
  return moduleAccess;
}

/**
 * Rate limit configuration for admin API
 */
const adminApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});


/**
 * GET endpoint for retrieving a user's module access
 */
export const GET = withMiddleware(async (req: NextRequest) => {
  try {
    // Get user ID from query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return errorResponse(
        new ValidationError('User ID is required'),
        HttpStatus.BAD_REQUEST
      );
    }
    
    // Get module access for the user
    const moduleAccess = await getUserModuleAccess(userId);
    
    // Return successful response
    return successResponse<Record<string, boolean>>(
      moduleAccess,
      { 
        timestamp: new Date().toISOString()
      },
      HttpStatus.OK
    );
  } catch (error) {
    return errorResponse(error);
  }
});

/**
 * POST endpoint for updating module access
 */
export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    // Validate request body
    const validation = await validateRequest(moduleAccessSchema)(req);
    if ('error' in validation) {
      return validation.error;
    }
    
    const { userId, moduleId, hasAccess } = validation.data;
    
    // Update module access
    const updatedAccess = await updateUserModuleAccess(userId, moduleId, hasAccess);
    
    // Return successful response
    return successResponse<Record<string, boolean>>(
      updatedAccess,
      { 
        timestamp: new Date().toISOString()
      },
      HttpStatus.OK
    );
  } catch (error) {
    return errorResponse(error);
  }
});

