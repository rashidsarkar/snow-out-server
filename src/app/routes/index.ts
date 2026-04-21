import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route';

import { AuthRoutes } from '../modules/Auth/auth.route';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { TaskRoutes } from '../modules/task/task.routes';
import { stripeRoutes } from '../modules/stripe/stripe.routes';
import { reportTaskRoutes } from '../modules/reportTask/reportTask.routes';
import { reviewRoutes } from '../modules/review/review.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { ProviderRoutes } from '../modules/provider/provider.routes';
// import { paymentRoutes } from '../modules/payment/payment.routes';

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
  // {
  //   path: '/meta',
  //   route: metaRoutes,
  // },
  {
    path: '/normal-User',
    route: normalUserRoutes,
  },
  {
    path: '/manage-Web',
    route: ManageRoutes,
  },
  {
    path: '/task',
    route: TaskRoutes,
  },
  {
    path: '/stripe',
    route: stripeRoutes,
  },
  {
    path: '/report',
    route: reportTaskRoutes,
  },
  {
    path: '/review',
    route: reviewRoutes,
  },
  {
    path: '/service',
    route: ServiceRoutes,
  },
  {
    path: '/provider',
    route: ProviderRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
//TODO -  this is my main routes
