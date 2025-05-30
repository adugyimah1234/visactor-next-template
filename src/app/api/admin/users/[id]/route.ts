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
} from '@/lib/api/middleware';
import { errorResponse, notFoundResponse, successResponse } from '@/lib/api/response';
import { ApiResponse, HttpStatus } from '@/lib/api/types';
import { 
  UpdateUserData, 
  User, 
  UserStatus, 
  updateUserSchema
} from '@/types/user';

// Reference to the mock users data
// In a real app, this would be in a database
// We're importing from the module scope to simulate a shared data store
import { mockUsers } from '../route';

/**
 * Validate user ID parameter
 */
function validateUserId(id: string): boolean {
  // Simple validation - ensure it's a non-empty string
  // In a real app, you might validate UUID format or other ID format
  return !!id && id.trim().length > 0;
}

/**
 * Find a user by ID
 * In a real app, this would query the database
 */
async function findUserById(id: string): Promise<User | null> {
  // In a real app, this would be a database query
  // For example: return await db.users.findUnique({ where: { id } });
  return mockUsers.find(user => user.id === id) || null;
}

/**
 * Update a user by ID
 * In a real app, this would update a record in the database
 */
async function updateUser(id: string, updateData: UpdateUserData): Promise<User> {
  // Find the user to update
  const userIndex = mockUsers.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new NotFoundError('User');
  }
  
  // If email is being updated, check if it already exists
  if (updateData.email && updateData.email !== mockUsers[userIndex].email) {
    const emailExists = mockUsers.some(
      user => user.email === updateData.email && user.id !== id
    );
    if (emailExists) {
      throw new ValidationError('Email already exists', { email: 'This email is already in use' });
    }
  }
  
  // In a real app, you would handle password hashing here if it's being updated
  // if (updateData.password) {
  //   updateData.password = await bcrypt.hash(updateData.password, 10);
  // }
  
  // Update the user
  const updatedUser: User = {
    ...mockUsers[userIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  
  // In a real app, this would be a database update
  // For example: return await db.users.update({ where: { id }, data: updateData });
  mockUsers[userIndex] = updatedUser;
  
  return updatedUser;
}

/**
 * Delete a user by ID
 * In a real app, this would delete a record from the database
 */
async function deleteUser(id: string): Promise<void> {
  // Find the user index
  const userIndex = mockUsers.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new NotFoundError('User');
  }
  
  // Remove the user
  // In a real app, this would be a database delete or soft-delete
  // For example: await db.users.delete({ where: { id } });
  // Or for soft-delete: await db.users.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date() } });
  mockUsers.splice(userIndex, 1);
}

/**
 * Rate limit configuration for admin API
 */
const adminApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

/**
 * GET handler for retrieving a single user
 */
async function getUserHandler(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { id } = context.params;
    
    // Validate ID format
    if (!validateUserId(id)) {
      return errorResponse(
        new ValidationError('Invalid user ID format'),
        HttpStatus.BAD_REQUEST
      );
    }
    
    // Find the user
    const user = await findUserById(id);
    
    // If user not found, return 404
    if (!user) {
      return notFoundResponse('User');
    }
    
    // Return successful response
    return successResponse<User>(
      user,
      {
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
      },
      HttpStatus.OK
    );
  } catch (error) {
    // Let the error handling middleware take care of errors
    throw error;
  }
}

/**
 * PATCH handler for updating a user
 */
async function updateUserHandler(
  req: NextRequest,
  context: { params: { id: string }, data: UpdateUserData }
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { id } = context.params;
    const updateData = context.data;
    
    // Validate ID format
    if (!validateUserId(id)) {
      return errorResponse(
        new ValidationError('Invalid user ID format'),
        HttpStatus.BAD_REQUEST
      );
    }
    
    // Sanitize input data to prevent XSS
    const sanitizedData = sanitizeRequestData(updateData);
    
    // Update the user
    const updatedUser = await updateUser(id, sanitizedData);
    
    // Return successful response
    return successResponse<User>(
      updatedUser,
      {
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
      },
      HttpStatus.OK
    );
  } catch (error) {
    // Let the error handling middleware take care of errors
    throw error;
  }
}

/**
 * DELETE handler for removing a user
 */
async function deleteUserHandler(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const { id } = context.params;
    
    // Validate ID format
    if (!validateUserId(id)) {
      return errorResponse(
        new ValidationError('Invalid user ID format'),
        HttpStatus.BAD_REQUEST
      );
    }
    
    // Delete the user
    await deleteUser(id);
    
    // Return successful response
    return successResponse<{ success: boolean }>(
      { success: true },
      {
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
      },
      HttpStatus.OK
    );
  } catch (error) {
    // Let the error handling middleware take care of errors
    throw error;
  }
}

/**
 * GET handler for retrieving a single user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return withMiddleware<User>(
    getUserHandler,
    [
      logRequest({ logLevel: 'info' }), // Log the request
      adminApiRateLimit, // Apply rate limiting
      requireAuth(), // Check if user is authenticated
      requireRole([UserRole.ADMIN]), // Check if user has admin role
    ]
  )(req, { params });
}

/**
 * PATCH handler for updating a user
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return withMiddleware<User>(
    updateUserHandler,
    [
      logRequest({ logLevel: 'info' }), // Log the request
      adminApiRateLimit, // Apply rate limiting
      requireAuth(), // Check if user is authenticated
      requireRole([UserRole.ADMIN]), // Check if user has admin role
      validateRequest<UpdateUserData>(updateUserSchema), // Validate request body
    ]
  )(req, { params });
}

/**
 * DELETE handler for removing a user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return withMiddleware<{ success: boolean }>(
    deleteUserHandler,
    [
      logRequest({ logLevel: 'info' }), // Log the request
      adminApiRateLimit, // Apply rate limiting
      requireAuth(), // Check if user is authenticated
      requireRole([UserRole.ADMIN]), // Check if user has admin role
    ]
  )(req, { params });
}

