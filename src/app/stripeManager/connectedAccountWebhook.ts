/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../config';
import StripeService from '../modules/stripe/stripe.service';
import stripe from '../utils/stripe';
import updateStripeConnectedAccountStatus from './updateStripeAccountConnectedStatus';
import Task from '../modules/task/task.model';
import { TaskStatus } from '../modules/task/task.interface';

// const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const handleConnectedAccountWebhook = async (req: Request, res: Response) => {
  const endpointSecret = config.stripe
    .connected_account_webhook_secret as string;

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret,
    );

    console.log('Received Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log(
          `Stripe account updated: ${account}, details_submitted: ${account.details_submitted}`,
        );
        if (account.details_submitted) {
          try {
            await updateStripeConnectedAccountStatus(account.id);
          } catch (err) {
            console.error(
              `Failed to update client status for Stripe account ID: ${account.id}`,
              err,
            );
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, subscriptionId } = paymentIntent.metadata;

        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { taskId, amount } = session.metadata;
        console.log('Payment successful for task:', taskId, 'Amount:', amount);

        if (!taskId) {
          console.error('taskId not found in checkout session metadata');
          break;
        }

        try {
          const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { taskStatus: TaskStatus.ASSIGNED },
            { new: true },
          );

          if (updatedTask) {
            console.log('Task updated successfully:', updatedTask._id);
          } else {
            console.error('Task not found with ID:', taskId);
          }
        } catch (err) {
          console.error('Error updating task:', err);
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Success');
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default handleConnectedAccountWebhook;
