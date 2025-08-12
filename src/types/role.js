/**
 * Role types for the application
 */
import { z } from 'zod';
import { UserRole } from '@/lib/api/auth';
/**
 * Permission represents a specific action that can be performed
 */
export var Permission;
(function (Permission) {
    // User management
    Permission["VIEW_USERS"] = "view_users";
    Permission["CREATE_USER"] = "create_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    // Role management
    Permission["VIEW_ROLES"] = "view_roles";
    Permission["CREATE_ROLE"] = "create_role";
    Permission["UPDATE_ROLE"] = "update_role";
    Permission["DELETE_ROLE"] = "delete_role";
    // School management
    Permission["VIEW_SCHOOLS"] = "view_schools";
    Permission["CREATE_SCHOOL"] = "create_school";
    Permission["UPDATE_SCHOOL"] = "update_school";
    Permission["DELETE_SCHOOL"] = "delete_school";
    // Class management
    Permission["VIEW_CLASSES"] = "view_classes";
    Permission["CREATE_CLASS"] = "create_class";
    Permission["UPDATE_CLASS"] = "update_class";
    Permission["DELETE_CLASS"] = "delete_class";
    // Category management
    Permission["VIEW_CATEGORIES"] = "view_categories";
    Permission["CREATE_CATEGORY"] = "create_category";
    Permission["UPDATE_CATEGORY"] = "update_category";
    Permission["DELETE_CATEGORY"] = "delete_category";
    // Module access
    Permission["VIEW_MODULES"] = "view_modules";
    Permission["UPDATE_MODULE_ACCESS"] = "update_module_access";
    // Registration
    Permission["VIEW_REGISTRATIONS"] = "view_registrations";
    Permission["CREATE_REGISTRATION"] = "create_registration";
    Permission["UPDATE_REGISTRATION"] = "update_registration";
    Permission["DELETE_REGISTRATION"] = "delete_registration";
    // Admissions
    Permission["VIEW_ADMISSIONS"] = "view_admissions";
    Permission["UPDATE_ADMISSION_STATUS"] = "update_admission_status";
    Permission["DELETE_ADMISSION"] = "delete_admission";
    // Exams
    Permission["VIEW_EXAMS"] = "view_exams";
    Permission["CREATE_EXAM"] = "create_exam";
    Permission["UPDATE_EXAM"] = "update_exam";
    Permission["DELETE_EXAM"] = "delete_exam";
    Permission["RECORD_EXAM_RESULTS"] = "record_exam_results";
    // Fees
    Permission["VIEW_FEES"] = "view_fees";
    Permission["CREATE_FEE"] = "create_fee";
    Permission["UPDATE_FEE"] = "update_fee";
    Permission["DELETE_FEE"] = "delete_fee";
    Permission["RECORD_PAYMENT"] = "record_payment";
    // System settings
    Permission["VIEW_SETTINGS"] = "view_settings";
    Permission["UPDATE_SETTINGS"] = "update_settings";
})(Permission || (Permission = {}));
/**
 * Permission category for grouping permissions
 */
export var PermissionCategory;
(function (PermissionCategory) {
    PermissionCategory["USER_MANAGEMENT"] = "User Management";
    PermissionCategory["ROLE_MANAGEMENT"] = "Role Management";
    PermissionCategory["SCHOOL_MANAGEMENT"] = "School Management";
    PermissionCategory["CLASS_MANAGEMENT"] = "Class Management";
    PermissionCategory["CATEGORY_MANAGEMENT"] = "Category Management";
    PermissionCategory["MODULE_ACCESS"] = "Module Access";
    PermissionCategory["REGISTRATION"] = "Registration";
    PermissionCategory["ADMISSIONS"] = "Admissions";
    PermissionCategory["EXAMS"] = "Exams";
    PermissionCategory["FEES"] = "Fees";
    PermissionCategory["SYSTEM_SETTINGS"] = "System Settings";
})(PermissionCategory || (PermissionCategory = {}));
/**
 * Mapping of permissions to their categories
 */
export const permissionCategories = {
    // User management
    [Permission.VIEW_USERS]: PermissionCategory.USER_MANAGEMENT,
    [Permission.CREATE_USER]: PermissionCategory.USER_MANAGEMENT,
    [Permission.UPDATE_USER]: PermissionCategory.USER_MANAGEMENT,
    [Permission.DELETE_USER]: PermissionCategory.USER_MANAGEMENT,
    // Role management
    [Permission.VIEW_ROLES]: PermissionCategory.ROLE_MANAGEMENT,
    [Permission.CREATE_ROLE]: PermissionCategory.ROLE_MANAGEMENT,
    [Permission.UPDATE_ROLE]: PermissionCategory.ROLE_MANAGEMENT,
    [Permission.DELETE_ROLE]: PermissionCategory.ROLE_MANAGEMENT,
    // School management
    [Permission.VIEW_SCHOOLS]: PermissionCategory.SCHOOL_MANAGEMENT,
    [Permission.CREATE_SCHOOL]: PermissionCategory.SCHOOL_MANAGEMENT,
    [Permission.UPDATE_SCHOOL]: PermissionCategory.SCHOOL_MANAGEMENT,
    [Permission.DELETE_SCHOOL]: PermissionCategory.SCHOOL_MANAGEMENT,
    // Class management
    [Permission.VIEW_CLASSES]: PermissionCategory.CLASS_MANAGEMENT,
    [Permission.CREATE_CLASS]: PermissionCategory.CLASS_MANAGEMENT,
    [Permission.UPDATE_CLASS]: PermissionCategory.CLASS_MANAGEMENT,
    [Permission.DELETE_CLASS]: PermissionCategory.CLASS_MANAGEMENT,
    // Category management
    [Permission.VIEW_CATEGORIES]: PermissionCategory.CATEGORY_MANAGEMENT,
    [Permission.CREATE_CATEGORY]: PermissionCategory.CATEGORY_MANAGEMENT,
    [Permission.UPDATE_CATEGORY]: PermissionCategory.CATEGORY_MANAGEMENT,
    [Permission.DELETE_CATEGORY]: PermissionCategory.CATEGORY_MANAGEMENT,
    // Module access
    [Permission.VIEW_MODULES]: PermissionCategory.MODULE_ACCESS,
    [Permission.UPDATE_MODULE_ACCESS]: PermissionCategory.MODULE_ACCESS,
    // Registration
    [Permission.VIEW_REGISTRATIONS]: PermissionCategory.REGISTRATION,
    [Permission.CREATE_REGISTRATION]: PermissionCategory.REGISTRATION,
    [Permission.UPDATE_REGISTRATION]: PermissionCategory.REGISTRATION,
    [Permission.DELETE_REGISTRATION]: PermissionCategory.REGISTRATION,
    // Admissions
    [Permission.VIEW_ADMISSIONS]: PermissionCategory.ADMISSIONS,
    [Permission.UPDATE_ADMISSION_STATUS]: PermissionCategory.ADMISSIONS,
    [Permission.DELETE_ADMISSION]: PermissionCategory.ADMISSIONS,
    // Exams
    [Permission.VIEW_EXAMS]: PermissionCategory.EXAMS,
    [Permission.CREATE_EXAM]: PermissionCategory.EXAMS,
    [Permission.UPDATE_EXAM]: PermissionCategory.EXAMS,
    [Permission.DELETE_EXAM]: PermissionCategory.EXAMS,
    [Permission.RECORD_EXAM_RESULTS]: PermissionCategory.EXAMS,
    // Fees
    [Permission.VIEW_FEES]: PermissionCategory.FEES,
    [Permission.CREATE_FEE]: PermissionCategory.FEES,
    [Permission.UPDATE_FEE]: PermissionCategory.FEES,
    [Permission.DELETE_FEE]: PermissionCategory.FEES,
    [Permission.RECORD_PAYMENT]: PermissionCategory.FEES,
    // System settings
    [Permission.VIEW_SETTINGS]: PermissionCategory.SYSTEM_SETTINGS,
    [Permission.UPDATE_SETTINGS]: PermissionCategory.SYSTEM_SETTINGS,
};
/**
 * Default role mapping for user types
 */
export const defaultRolesByUserType = {
    [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions
    [UserRole.TEACHER]: [
        // Teachers can view users but not create/update/delete
        Permission.VIEW_USERS,
        // Teachers can view class information
        Permission.VIEW_CLASSES,
        // Teachers can view and work with exams
        Permission.VIEW_EXAMS,
        Permission.CREATE_EXAM,
        Permission.UPDATE_EXAM,
        Permission.RECORD_EXAM_RESULTS,
        // Teachers can view registrations
        Permission.VIEW_REGISTRATIONS,
        // Teachers can view admissions
        Permission.VIEW_ADMISSIONS,
        // Teachers can view categories
        Permission.VIEW_CATEGORIES,
    ],
    [UserRole.STUDENT]: [
        // Students can view registrations
        Permission.VIEW_REGISTRATIONS,
        // Students can view their own exam results (but not create/update)
        Permission.VIEW_EXAMS,
        // Students can view fee information
        Permission.VIEW_FEES,
    ],
    [UserRole.PARENT]: [
        // Parents can view registrations
        Permission.VIEW_REGISTRATIONS,
        // Parents can view exam results
        Permission.VIEW_EXAMS,
        // Parents can view and pay fees
        Permission.VIEW_FEES,
        Permission.RECORD_PAYMENT,
    ],
    [UserRole.STAFF]: [
        // Staff can view users
        Permission.VIEW_USERS,
        // Staff can manage registrations
        Permission.VIEW_REGISTRATIONS,
        Permission.CREATE_REGISTRATION,
        Permission.UPDATE_REGISTRATION,
        // Staff can view classes
        Permission.VIEW_CLASSES,
        // Staff can view and manage admissions
        Permission.VIEW_ADMISSIONS,
        Permission.UPDATE_ADMISSION_STATUS,
        // Staff can view and manage fees
        Permission.VIEW_FEES,
        Permission.CREATE_FEE,
        Permission.UPDATE_FEE,
        Permission.RECORD_PAYMENT,
    ],
};
// Zod schemas for validation
/**
 * Role creation schema
 */
export const createRoleSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    description: z
        .string()
        .min(5, 'Description must be at least 5 characters')
        .max(500, 'Description cannot exceed 500 characters'),
    permissions: z.array(z.nativeEnum(Permission, {
        errorMap: () => ({ message: 'Invalid permission' }),
    })),
    isDefault: z.boolean().optional().default(false),
});
/**
 * Role update schema
 */
export const updateRoleSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .optional(),
    description: z
        .string()
        .min(5, 'Description must be at least 5 characters')
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    permissions: z
        .array(z.nativeEnum(Permission, {
        errorMap: () => ({ message: 'Invalid permission' }),
    }))
        .optional(),
    isDefault: z.boolean().optional(),
});
/**
 * Pagination schema for roles
 */
export const rolePaginationSchema = z.object({
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
        .enum(['name', 'createdAt'], {
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
});
