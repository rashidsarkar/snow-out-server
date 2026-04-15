import { Request, Response } from 'express';
import stripe from '../utils/stripe';
import Task from '../modules/task/task.model';
import { TaskStatus } from '../modules/task/task.interface';

const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).send('Missing session_id');
    }

    const session = await stripe.checkout.sessions.retrieve(
      session_id as string,
    );

    if (session.payment_status === 'paid') {
      const { taskId } = session.metadata || {};
      if (taskId) {
        await Task.findByIdAndUpdate(taskId, {
          taskStatus: TaskStatus.ASSIGNED,
        });
        console.log('Task status updated to ASSIGNED for task:', taskId);
      }
    }

    // Redirect to frontend success page
    res.redirect('http://localhost:3000/payment-success');
  } catch (error) {
    console.error('Payment success handler error:', error);
    res.status(500).send('Internal Server Error');
  }
};

export default handlePaymentSuccess;
