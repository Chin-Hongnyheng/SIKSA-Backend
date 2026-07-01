export const ROLE_PERMISSIONS = {
  User: [
    'course:view',
    'course:subscribe',
    'course:create',
    'course:edit',
    'course:delete',
    'assessment:view',
    'assessment:create',
    'assessment:delete',
    'schedule:view',
    'schedule:create',
    'schedule:edit',
    'schedule:delete',
<<<<<<< HEAD
    'grade:upsert',
    'grade:view',
=======
    'attendance:view',
    'attendance:mark',
    'attendance:manage',
>>>>>>> Nyhengdev
  ],
  Admin: ['*'],
} as const;
