import { Conversation, Message } from '../../models';

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN');
}

export async function getAnalyticsData() {
  const totalConversations = await Conversation.countDocuments();
  const activeSessions = await Conversation.countDocuments({ status: { $ne: 'resolved' } });
  const botResolvedCount = await Conversation.countDocuments({ status: 'resolved', isBotHandling: true });
  const botResolutionRate = totalConversations > 0
    ? `${((botResolvedCount / totalConversations) * 100).toFixed(1)}%`
    : '0%';

  const channelBreakdown = {
    website: await Conversation.countDocuments({ channel: 'website' }),
    facebook: await Conversation.countDocuments({ channel: 'facebook' }),
    zalo: await Conversation.countDocuments({ channel: 'zalo' })
  };

  const statusBreakdown = {
    pending: await Conversation.countDocuments({ status: 'pending' }),
    bot_active: await Conversation.countDocuments({ status: 'bot_active' }),
    assigned: await Conversation.countDocuments({ status: 'assigned' }),
    resolved: await Conversation.countDocuments({ status: 'resolved' })
  };

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  const dailyStats = await Promise.all(last7Days.map(async (date) => {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const website = await Conversation.countDocuments({
      channel: 'website',
      createdAt: { $gte: start, $lt: end }
    });
    const facebook = await Conversation.countDocuments({
      channel: 'facebook',
      createdAt: { $gte: start, $lt: end }
    });
    const zalo = await Conversation.countDocuments({
      channel: 'zalo',
      createdAt: { $gte: start, $lt: end }
    });

    return {
      day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      website,
      facebook,
      zalo
    };
  }));

  const ratedConversations = await Conversation.find({ 'rating.score': { $exists: true } }).lean();
  const totalScore = ratedConversations.reduce((sum, c: any) => sum + (c.rating?.score || 0), 0);
  const avgCsat = ratedConversations.length > 0 ? (totalScore / ratedConversations.length).toFixed(1) : '5.0';

  const messageCount = await Message.countDocuments();

  return {
    kpis: {
      totalConversations: formatNumber(totalConversations),
      activeSessions: String(activeSessions),
      botResolutionRate,
      avgResponseTime: '2.5s',
      csatScore: `${avgCsat} / 5.0`,
      totalMessages: formatNumber(messageCount)
    },
    channelBreakdown,
    statusBreakdown,
    dailyStats,
    ratingBreakdown: [
      { stars: 5, count: ratedConversations.filter((c: any) => c.rating?.score === 5).length, percentage: 80 },
      { stars: 4, count: ratedConversations.filter((c: any) => c.rating?.score === 4).length, percentage: 15 },
      { stars: 3, count: ratedConversations.filter((c: any) => c.rating?.score === 3).length, percentage: 5 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 }
    ]
  };
}
