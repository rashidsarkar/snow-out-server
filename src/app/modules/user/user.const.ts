export const USER_ROLE = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER',
} as const;
export type ENUM_USER_ROLE = (typeof USER_ROLE)[keyof typeof USER_ROLE];
