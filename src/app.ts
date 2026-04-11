import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';

import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import onboardingRefresh from './app/handleStripe/onboardingRefresh';

const app: Application = express();
app.post(
  '/connected-account-webhook',
  express.raw({ type: 'application/json' }),
  handleConnectedAccountWebhook,
);
// parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://10.10.20.48:5173',
      'http://10.10.20.48:3000',
      'http://localhost:5454',
      'http://10.10.20.3:5454',
      'http://192.168.0.107:3000',
      'http://192.168.0.104:3000',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://10.10.20.48:5173',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow the header you are sending
  }),
);
// app.use(
//   cors({
//     origin: ['http://localhost:5454', 'http://10.10.20.3:5454'],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: [
//       'Content-Type',
//       'Authorization',
//       'X-Requested-With',
//       'Accept',
//       'Origin',
//     ],
//   }),
// );

app.use('/api/v1/', router);
app.use('/uploads', express.static('uploads'));
//Not Found

app.get('/stripe/onboarding/refresh', onboardingRefresh);
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World! From snow out server with rongila');
});

app.use(globalErrorHandler);

app.use(notFound);
export default app;
