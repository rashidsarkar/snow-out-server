import Notification from '../modules/notification/notification.model';

const getNotificationCount = async (receiver: string = '') => {
  const unseenCount = await Notification.countDocuments({
    $and: [
      {
        $or: [
          { receiver: receiver },
          { receiver: 'all' }
        ]
      },
      { seenBy: { $ne: receiver } },
      { deleteBy: { $ne: receiver } }
    ]
  });

  const latestNotification = await Notification.findOne({
    $or: [{ receiver: receiver }, { receiver: 'all' }],
  })
    .sort({ createdAt: -1 })
    .lean();
  return { unseenCount, latestNotification };
};

export default getNotificationCount;
