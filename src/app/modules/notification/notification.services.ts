import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.const';
import Notification from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';

const getAllNotificationFromDB = async (
  query: Record<string, any>,
  user: JwtPayload,
) => {
  // Fix 1: Always search 'title' because 'name' doesn't exist in Notification schema
  const searchField = 'title';

  // Fix 2: If the user is an Admin, they should see notifications sent to
  // their specific profileId, the string "admin", and "all".
  const receiverConditions: any[] = [
    { receiver: user.profileId },
    { receiver: 'all' },
  ];

  if (user.role === USER_ROLE.ADMIN) {
    receiverConditions.push({ receiver: USER_ROLE.ADMIN }); // Checks for "admin" string
  }

  const notificationQuery = new QueryBuilder(
    Notification.find({
      $or: receiverConditions,
      deleteBy: { $ne: user.profileId },
    }),
    query,
  )
    .search([searchField])
    .filter()
    .sort()
    .paginate();

  const result = await notificationQuery.modelQuery;
  const meta = await notificationQuery.countTotal();
  return { meta, result };
};

const seeNotification = async (user: JwtPayload) => {
  const receiverConditions: any[] = [
    { receiver: user.profileId },
    { receiver: 'all' },
  ];

  // Logic: Admin needs to mark notifications sent to "admin" as seen too
  if (user?.role === USER_ROLE.ADMIN) {
    receiverConditions.push({ receiver: USER_ROLE.ADMIN });
  }

  const result = await Notification.updateMany(
    {
      $or: receiverConditions,
      seenBy: { $ne: user.profileId }, // Only update if NOT already in the seenBy array
    },
    { $addToSet: { seenBy: user.profileId } },
    { runValidators: true },
  );

  return result;
};

const deleteNotification = async (id: string, profileId: string) => {
  const notification = await Notification.findById(id);

  if (!notification) {
    return null;
  }

  // ১. যদি নোটিফিকেশনটি সরাসরি ওই ইউজারের প্রোফাইল আইডিতে পাঠানো হয় (Private)
  if (notification.receiver === profileId) {
    return await Notification.findByIdAndDelete(id);
  }

  // ২. যদি নোটিফিকেশনটি সবার জন্য ('all') অথবা সব অ্যাডমিনের জন্য ('admin') হয়
  // এই ক্ষেত্রে আমরা হার্ড ডিলিট করবো না, শুধু ইউজারের আইডিতে deleteBy তে যোগ করবো
  if (
    notification.receiver === 'all' ||
    notification.receiver === USER_ROLE.ADMIN
  ) {
    return await Notification.findByIdAndUpdate(
      id,
      {
        $addToSet: { deleteBy: profileId },
      },
      { new: true },
    );
  }

  return null;
};
const createNotification = async (
  receivers: string | string[],
  title: string,
  message: string,
) => {
  const receiverArray = Array.isArray(receivers) ? receivers : [receivers];

  const notifications = await Promise.all(
    receiverArray.map((receiver) =>
      Notification.create({
        title,
        message,
        receiver,
        seenBy: [],
        deleteBy: [],
      }),
    ),
  );

  return notifications;
};

const notificationService = {
  getAllNotificationFromDB,
  seeNotification,
  deleteNotification,
  createNotification,
};

export default notificationService;
