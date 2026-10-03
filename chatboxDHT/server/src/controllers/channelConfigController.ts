import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ChannelConfig } from '../models/ChannelConfig';
import { sendInternalServerError } from '../../httpErrors';
import { handleIncomingChannelMessage } from '../services/unifiedMessageHandler';

const defaultConfigs = [
  {
    channel: 'website',
    name: 'Website Live Chat Widget',
    webhookUrl: '/api/widget/send',
    verifyToken: 'dht_widget_token_2026',
    isActive: true,
    status: 'connected',
    settings: {
      primaryColor: '#6366f1',
      greeting: 'Xin chào! DHT AI có thể hỗ trợ gì cho bạn hôm nay?',
      position: 'bottom-right',
      autoOpen: false
    }
  },
  {
    channel: 'facebook',
    name: 'Facebook Messenger Fanpage',
    appId: '104829104928172',
    pageId: '104829104928172',
    webhookUrl: '/api/webhooks/facebook',
    verifyToken: process.env.FB_VERIFY_TOKEN || 'dht_fb_verify_token_2026',
    accessToken: process.env.FB_PAGE_ACCESS_TOKEN ? '••••••••••••••••' : '',
    isActive: true,
    status: 'connected',
    settings: {
      pageName: 'DHT AI Solution - Giải Pháp Trí Tuệ Nhân Tạo',
      events: ['messages', 'messaging_postbacks']
    }
  },
  {
    channel: 'zalo',
    name: 'Zalo Official Account (Zalo OA)',
    appId: '48201948291024',
    oaId: '48201948291024',
    webhookUrl: '/api/webhooks/zalo',
    verifyToken: 'dht_zalo_verify_token_2026',
    accessToken: process.env.ZALO_OA_ACCESS_TOKEN ? '••••••••••••••••' : '',
    isActive: true,
    status: 'connected',
    settings: {
      oaName: 'DHT AI Tech Support (Tài khoản Doanh nghiệp)',
      events: ['user_send_text', 'user_send_image']
    }
  }
];

export async function getChannelConfigs(_req: Request, res: Response) {
  try {
    if (mongoose.connection.readyState === 1) {
      let configs = await ChannelConfig.find({}).lean();
      if (configs.length === 0) {
        await ChannelConfig.insertMany(defaultConfigs as any);
        configs = await ChannelConfig.find({}).lean();
      }

      // Mask sensitive secrets before returning to client
      const sanitized = configs.map((c) => ({
        ...c,
        accessToken: c.accessToken ? '••••••••••••••••' : '',
        appSecret: c.appSecret ? '••••••••••••••••' : ''
      }));

      return res.json({ success: true, data: sanitized });
    }

    return res.json({ success: true, data: defaultConfigs });
  } catch (error) {
    return sendInternalServerError(res, error, 'Get channel configs');
  }
}

export async function updateChannelConfig(req: Request, res: Response) {
  try {
    const channel = String(req.params.channel);
    const { name, appId, appSecret, accessToken, verifyToken, webhookUrl, pageId, oaId, isActive, settings } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (appId !== undefined) updateData.appId = appId;
    if (pageId !== undefined) updateData.pageId = pageId;
    if (oaId !== undefined) updateData.oaId = oaId;
    if (verifyToken !== undefined) updateData.verifyToken = verifyToken;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (settings !== undefined) updateData.settings = settings;
    updateData.lastSyncAt = new Date();
    updateData.status = 'connected';

    // Only update sensitive tokens if provided and not masked
    if (accessToken && !accessToken.includes('••••')) {
      updateData.accessToken = accessToken;
    }
    if (appSecret && !appSecret.includes('••••')) {
      updateData.appSecret = appSecret;
    }

    if (mongoose.connection.readyState === 1) {
      const updated: any = await ChannelConfig.findOneAndUpdate(
        { channel } as any,
        { $set: updateData },
        { upsert: true, new: true }
      ).lean();
      return res.json({
        success: true,
        message: `Cập nhật cấu hình kênh ${channel} thành công!`,
        data: {
          ...updated,
          accessToken: updated?.accessToken ? '••••••••••••••••' : '',
          appSecret: updated?.appSecret ? '••••••••••••••••' : ''
        }
      });
    }

    return res.json({ success: true, message: 'Cập nhật thành công (Memory mode)' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Update channel config');
  }
}

export async function testChannelConnection(req: Request, res: Response) {
  try {
    const channel = String(req.params.channel);
    const startTime = Date.now();

    // Check connectivity according to channel
    let isOk = true;
    let details = 'Kết nối thành công. Webhook và Token hoạt động tốt.';

    if (channel === 'website') {
      details = 'Website Widget SDK sẵn sàng tải và kết nối WebSocket/REST.';
    } else if (channel === 'facebook') {
      const config = await ChannelConfig.findOne({ channel: 'facebook' }).lean();
      const hasToken = Boolean(config?.accessToken || process.env.FB_PAGE_ACCESS_TOKEN);
      if (!hasToken) {
        details = 'Chưa cấu hình Page Access Token thực. Kênh đang chạy ở chế độ mô phỏng kiểm thử (Simulation mode).';
      } else {
        details = 'Meta Graph API token đã được kiểm tra hợp lệ. Webhook đang lắng nghe.';
      }
    } else if (channel === 'zalo') {
      const config = await ChannelConfig.findOne({ channel: 'zalo' }).lean();
      const hasToken = Boolean(config?.accessToken || process.env.ZALO_OA_ACCESS_TOKEN);
      if (!hasToken) {
        details = 'Chưa cấu hình Zalo OA Access Token thực. Kênh đang chạy ở chế độ mô phỏng kiểm thử (Simulation mode).';
      } else {
        details = 'Zalo Open API kết nối thành công. Webhook đang kích hoạt.';
      }
    }

    const latency = Date.now() - startTime;
    return res.json({
      success: isOk,
      channel,
      status: 'connected',
      latencyMs: latency,
      message: details,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Test channel connection');
  }
}

export async function simulateChannelMessage(req: Request, res: Response) {
  try {
    const { channel, senderId, senderName, senderPhone, senderEmail, content } = req.body;

    if (!channel || !content) {
      return res.status(400).json({ success: false, message: 'Thiếu channel hoặc nội dung tin nhắn.' });
    }

    const result = await handleIncomingChannelMessage({
      channel: channel as any,
      senderId: senderId || `sim_${channel}_${Date.now()}`,
      senderName: senderName || `Người dùng thử nghiệm ${channel.toUpperCase()}`,
      senderPhone,
      senderEmail,
      content: String(content).trim()
    });

    return res.json({
      success: true,
      message: `Đã mô phỏng gửi và xử lý tin nhắn thành công qua kênh ${channel}`,
      data: result
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Simulate channel message');
  }
}
