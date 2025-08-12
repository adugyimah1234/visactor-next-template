/**
 * User types for the application
 */
import { z } from 'zod';
import { UserRole } from '@/lib/api/auth';
/**
 * User status enum
 */
export var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (UserStatus = {}));
// Zod schema for validation
/**
 * User creation schema
 */
export const createUserSchema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(5, 'Email must be at least 5 characters')
        .max(255, 'Email cannot exceed 255 characters'),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    role: z.nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Invalid user role' }),
    }),
    status: z
        .nativeEnum(UserStatus, {
        errorMap: () => ({ message: 'Invalid user status' }),
    })
        .optional(),
    profileImage: z.string().url('Profile image must be a valid URL').optional(),
});
/**
 * User update schema
 */
export const updateUserSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .optional(),
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(5, 'Email must be at least 5 characters')
        .max(255, 'Email cannot exceed 255 characters')
        .optional(),
    role: z
        .nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Invalid user role' }),
    })
        .optional(),
    status: z
        .nativeEnum(UserStatus, {
        errorMap: () => ({ message: 'Invalid user status' }),
    })
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .optional(),
    profileImage: z.string().url('Profile image must be a valid URL').optional(),
});
/**
 * Pagination schema
 */
export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int('Page must be an integer')
        .positive('Page must be positive')
        .default(1),
    pageSize: z.coerce
        .number()
        .int('Page size must be an integer')
        .positive('Page size must be positive')
        .max(100, 'Page size cannot exceed 100')
        .default(10),
    sortBy: z
        .enum(['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'], {
        errorMap: () => ({ message: 'Invalid sort field' }),
    })
        .optional()
        .default('createdAt'),
    sortOrder: z
        .enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Sort order must be asc or desc' }),
    })
        .optional()
        .default('desc'),
    search: z.string().optional(),
    role: z
        .nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Invalid user role' }),
    })
        .optional(),
    status: z
        .nativeEnum(UserStatus, {
        errorMap: () => ({ message: 'Invalid user status' }),
    })
        .optional(),
});
