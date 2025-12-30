// src/permissions.js

/**
 * Defines the roles and the routes they have access to.
 * This is a central source of truth for Role-Based Access Control (RBAC).
 *
 * Each key is a route path, and its value is an array of roles
 * that are permitted to access that route.
 */
const PERMISSIONS = {
    // --- Public Routes ---
    '/home': ['admin', 'staff', 'student', 'guest'],
    '/news': ['admin', 'staff', 'student', 'guest'],
    '/login': ['admin', 'staff', 'student', 'guest'],
    '/#contact': ['admin', 'staff', 'student', 'guest'],
    
    // --- Admin Routes ---
    '/dashboard': ['admin'],
    '/student-management': ['admin'],
    '/staff-management': ['admin'],
    '/results-management': ['admin', 'staff'],
    '/admin-results-approval': ['admin'],
    '/view-reports': ['admin', 'staff'],
    '/academic-management': ['admin'],
    '/user-permissions-management': ['admin'],
    '/admin-messaging': ['admin'],
    '/admin-fees-management': ['admin'],
    '/admin-calendar-management': ['admin'],
    '/admin-syllabus-management': ['admin'],
    '/admin-timetable-management': ['admin'],
    '/admin-digital-library': ['admin'],
    '/admin-certification-management': ['admin'],

    // --- Student Routes ---
    '/student-dashboard': ['student'],
    '/student-profile': ['student'],
    '/student-results': ['student'],
    '/student-syllabus': ['student'],
    '/student-certification': ['student'],
    '/student-attendance': ['student'],
    '/student-subjects': ['student'],
    '/student-calendar': ['student'],
    '/student-fees': ['student'],
    '/student-mails': ['student'],
    '/student-password-change': ['student'],
    '/student-timetable': ['student'],
    '/student-digital-library': ['student'],
    '/student-certification-registration': ['student'],

    // --- Staff Routes ---
    '/staff-dashboard': ['staff'],
    '/staff-profile': ['staff'],
    '/staff-subjects': ['staff'],
    '/staff-calendar': ['staff'],
    '/staff-mails': ['staff'],
    '/staff-password-change': ['staff'],
    '/mark-attendance': ['staff'],
    '/staff-timetable': ['staff'],
    '/staff-digital-library': ['staff'],
};

/**
 * Checks if a given role has permission to access a specific route.
 * @param {string} role The user's role (e.g., 'admin', 'student', 'staff').
 * @param {string} route The route path to check.
 * @returns {boolean} True if the role has permission, false otherwise.
 */
export const hasPermission = (role, route) => {
    if (!PERMISSIONS[route]) {
        // If the route is not explicitly defined, deny access by default for security.
        return false;
    }
    return PERMISSIONS[route].includes(role);
};
