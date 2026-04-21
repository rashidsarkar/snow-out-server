/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../config';

import Task from '../modules/task/task.model';
import { TaskStatus } from '../modules/task/task.interface';

// ✅ Initialize Stripe
const stripe = new Stripe(config.stripe.stripe_secret_key, {
  apiVersion: '2024-06-20',
});

// ✅ Webhook secret
const endpointSecret = config.stripe.webhook_secret as string;

// 🔹 Handle successful payment
const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
): Promise<void> => {
  if (session.payment_status !== 'paid') return;

  const taskId = session.metadata?.taskId;

  if (!taskId) {
    console.error('❌ taskId missing in metadata');
    return;
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { taskStatus: TaskStatus.ASSIGNED },
    { new: true },
  );

  if (!updatedTask) {
    console.error('❌ Task not found:', taskId);
    return;
  }

  console.log('🎉 Task updated:', updatedTask._id);
};

// 🔹 Handle failed payment
const handlePaymentFailed = (paymentIntent: Stripe.PaymentIntent): void => {
  console.log('❌ Payment failed:', paymentIntent.id);
};

// 🔹 Main webhook handler
const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // ✅ IMPORTANT: req.body must be RAW buffer
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (error: any) {
    console.error('❌ Signature verification failed:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  console.log('📩 Event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'payment_intent.payment_failed':
        handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`🤷 Unhandled event: ${event.type}`);
    }

    res.status(200).send('✅ Webhook received');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
};

export default handleWebhook;
