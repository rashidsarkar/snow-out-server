import getAdminNotificationCount from '../helper/getAdminNotification';
import getNotificationCount from '../helper/getUnseenNotification';
import { sendSinglePushNotification } from '../helper/sendPushNotification';
import Notification from '../modules/notification/notification.model';
import { USER_ROLE } from '../modules/user/user.const';
import { getIO } from '../socket/socket';

// একটি রেডি-টু-ইউজ ফাংশন
export const sendRealTimeNotification = async ({
  receivers,
  title,
  message,
  data = {},
  sendPush = true,
}: {
  receivers: string | string[];
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  sendPush?: boolean;
}) => {
  try {
    const io = getIO();
    const receiverArray = Array.isArray(receivers) ? receivers : [receivers];

    const results = [];

    for (const receiver of receiverArray) {
      // ১. ডাটাবেজে সেভ
      const notification = await Notification.create({
        title,
        message,
        receiver,
        seenBy: [],
        deleteBy: [],
      });

      results.push(notification);

      // ২. সকেট ইভেন্ট
      if (receiver === USER_ROLE.ADMIN) {
        const count = await getAdminNotificationCount();
        io.emit('admin-notification-update', count);
      } else if (receiver === 'all') {
        io.emit('global-notification', {
          title,
          message,
          _id: notification._id,
          createdAt: new Date(),
        });
      } else {
        // Get the latest count after creating the notification
        const count = await getNotificationCount(receiver);

        // Send the notification with the updated count
        io.to(receiver).emit('user-notification', {
          title,
          message,
          count: count.unseenCount,
          notification: {
            ...notification.toObject(),
            isSeen: false, // Explicitly mark as unseen
          },
          data,
        });
      }

      // ৩. পুশ নোটিফিকেশন (যদি ইউজার হয়)
      if (sendPush && receiver !== 'admin' && receiver !== 'all') {
        try {
          await sendSinglePushNotification(receiver, title, message, {
            ...data,
            notificationId: notification._id.toString(),
          });
        } catch (pushError) {
          console.error('Push notification failed:', pushError);
          // পুশ ফেইল করলে সকেট ঠিকই কাজ করবে
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
