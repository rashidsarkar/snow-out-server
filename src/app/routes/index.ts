import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route';

import { AuthRoutes } from '../modules/Auth/auth.route';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { insurerRoutes } from '../modules/insurer/insurer.routes';
import { claimlyGuideRoutes } from '../modules/claimlyGuide/claimlyGuide.routes';
import { metaRoutes } from '../modules/meta/meta.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
  {
    path: '/meta',
    route: metaRoutes,
  },
  {
    path: '/normal-User',
    route: normalUserRoutes,
  },
  {
    path: '/manage-Web',
    route: ManageRoutes,
  },
  {
    path: '/insurer',
    route: insurerRoutes,
  },
  {
    path: '/claimlyGuide',
    route: claimlyGuideRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
//TODO -  this is my main routes
