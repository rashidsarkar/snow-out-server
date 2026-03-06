export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  NORMALUSER: 'NORMALUSER',
} as const;
export type ENUM_USER_ROLE = (typeof USER_ROLE)[keyof typeof USER_ROLE];
