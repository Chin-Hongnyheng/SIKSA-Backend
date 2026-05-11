export const ROLE_PERMISSIONS = {
  Student: ['course:view'],
  Teacher: [
    'course:view',
    'course:create',
    'course:edit',
    'course:delete',
    'assessment:create',
    'assessment:edit',
    'assessment:delete',
    'assessment:view',
  ],
  Admin: ['*'],
} as const;
