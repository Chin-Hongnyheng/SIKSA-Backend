export const ROLE_PERMISSIONS = {
    student: ['course:view'],
    teacher: ['course:view', 'course:create'],
    admin: ['*'],
} as const;