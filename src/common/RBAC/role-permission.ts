export const ROLE_PERMISSIONS = {
  Student: ['course:view', 'course:subscribe', 'assessment:view'],
  Teacher: [
    'course:view',
    'course:create',
    'course:edit',
    'course:delete',
    'assessment:create',
    'assessment:delete',
    'assessment:view',
    'schedule:view',
    'schedule:create',
    'schedule:edit',
    'schedule:delete',
    'grade:upsert',
    'grade:view',
  ],
  Admin: ['*'],
} as const;
