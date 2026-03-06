import { ENUM_INSURER_NAME } from '../insurer/insurer.interface';
import Insurer from '../insurer/insurer.model';
import NormalUser from '../normalUser/normalUser.model';
import { User } from '../user/user.model';

const getDashboardMetaData = async () => {
  const [totalNormalUser, totalInsurer, totalBlockedUser] = await Promise.all([
    NormalUser.countDocuments(),
    Insurer.countDocuments(),
    User.countDocuments({
      isBlocked: true,
    }),
  ]);

  return {
    totalNormalUser,
    totalInsurer,
    totalBlockedUser,
  };
};

const getNormalUserChartData = async (year: number) => {
  const startOfYear = new Date(year, 0, 1);

  const endOfYear = new Date(year + 1, 0, 1);

  const chartData = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalUser: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id',
        totalUser: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const data = Array.from({ length: 12 }, (_, index) => ({
    month: months[index],
    totalUser:
      chartData.find((item) => item.month === index + 1)?.totalUser || 0,
  }));

  const yearsResult = await NormalUser.aggregate([
    {
      $group: {
        _id: { $year: '$createdAt' },
      },
    },
    {
      $project: {
        year: '$_id',
        _id: 0,
      },
    },
    {
      $sort: { year: 1 },
    },
  ]);

  const yearsDropdown = yearsResult.map((item: any) => item.year);

  return {
    chartData: data,
    yearsDropdown,
  };
};

const getInsuredCartDataWithTrend = async () => {
  // 📆 Date ranges
  const startOfCurrentMonth = new Date();
  startOfCurrentMonth.setDate(1);
  startOfCurrentMonth.setHours(0, 0, 0, 0);

  const startOfLastMonth = new Date(startOfCurrentMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  const startOfNextMonth = new Date(startOfCurrentMonth);
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

  // 🧮 Aggregate once
  const raw = await Insurer.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfLastMonth,
          $lt: startOfNextMonth,
        },
      },
    },
    {
      $project: {
        insurerName: 1,
        month: {
          $cond: [
            { $gte: ['$createdAt', startOfCurrentMonth] },
            'current',
            'last',
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          insurer: '$insurerName',
          month: '$month',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // 🧠 Normalize + calculate
  return Object.values(ENUM_INSURER_NAME).map((insurer) => {
    const current =
      raw.find((r) => r._id.insurer === insurer && r._id.month === 'current')
        ?.count || 0;

    const last =
      raw.find((r) => r._id.insurer === insurer && r._id.month === 'last')
        ?.count || 0;

    const delta = current - last;

    let percentChange = 0;
    if (last === 0 && current > 0) {
      percentChange = 100;
    } else if (last > 0) {
      percentChange = +((delta / last) * 100).toFixed(2);
    }

    let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (delta > 0) trend = 'positive';
    else if (delta < 0) trend = 'negative';

    return {
      insurer,
      currentMonth: current,
      lastMonth: last,
      delta,
      percentChange,
      trend,
    };
  });
};

const MetaService = {
  getDashboardMetaData,
  getNormalUserChartData,
  // getProviderChartData,
  getInsuredCartDataWithTrend,
};

export default MetaService;
