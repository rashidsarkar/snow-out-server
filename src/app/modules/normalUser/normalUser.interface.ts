/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface INormalUser {
  user: Types.ObjectId;
  profile_image?: string;
  fullName: string;
  email: string;
  phone: string;
}
