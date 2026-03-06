import { USER_ROLE } from '../modules/user/user.const';
import { User } from '../modules/user/user.model';

const getAdminIds = async () => {
  return await User.distinct('profileId', {
    role: USER_ROLE.ADMIN,
  });
};

export default getAdminIds;
