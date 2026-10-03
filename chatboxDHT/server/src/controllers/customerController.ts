import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Customer } from '../models/Customer';
import { Conversation } from '../models/Conversation';
import { sendInternalServerError } from '../../httpErrors';

const sampleCustomers = [
  {
    channelUserId: 'cust_01',
    channel: 'website',
    name: 'Nguyễn Thanh Tùng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '0988 123 456',
    email: 'thanhtung.it@gmail.com',
    address: 'Cầu Giấy, Hà Nội',
    tags: ['Khách VIP', 'Quan tâm gói Pro', 'DN Bán lẻ'],
    notes: ['Khách cần tích hợp cả Zalo OA và Fanpage bán giày dép', 'Đang yêu cầu demo trực tiếp kịch bản'],
    totalSpent: '12.500.000 ₫',
    lastActive: 'Vừa xong',
    orders: [
      {
        orderCode: 'DHT-9942',
        date: '10/09/2026',
        total: '4.500.000 ₫',
        status: 'completed',
        itemsSummary: 'Bản quyền AI Chatbot Pro (3 tháng)'
      }
    ],
    history: [
      { channel: 'website', timestamp: '14:20 Hôm nay', summary: 'Hỏi tính năng tự chốt đơn qua Zalo' },
      { channel: 'facebook', timestamp: '09:15 Hôm qua', summary: 'Nhắn hỏi bảng giá gói Pro' }
    ]
  },
  {
    channelUserId: '104928192847291',
    channel: 'facebook',
    name: 'Trần Minh Quân (Facebook)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '0912 345 678',
    email: 'quan.tran@gmail.com',
    address: 'Quận 1, TP. Hồ Chí Minh',
    tags: ['Từ Fanpage', 'Khách tiềm năng'],
    notes: ['Inquiry từ quảng cáo Facebook Messenger'],
    totalSpent: '4.500.000 ₫',
    lastActive: '10 phút trước',
    orders: [],
    history: [
      { channel: 'facebook', timestamp: '10 phút trước', summary: 'Hỏi tích hợp bot tự động trả lời bài viết' }
    ]
  },
  {
    channelUserId: '4829103948291',
    channel: 'zalo',
    name: 'Lê Hoàng Yến (Zalo OA)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '0977 888 999',
    email: 'hoangyen.le@outlook.com',
    address: 'Hải Châu, Đà Nẵng',
    tags: ['Zalo OA', 'DN F&B'],
    notes: ['Cần bot AI đặt bàn và gửi thông báo đơn hàng qua Zalo ZNS'],
    totalSpent: '8.900.000 ₫',
    lastActive: '1 giờ trước',
    orders: [
      {
        orderCode: 'DHT-8821',
        date: '15/09/2026',
        total: '8.900.000 ₫',
        status: 'completed',
        itemsSummary: 'Gói AI Omnichannel Doanh nghiệp'
      }
    ],
    history: [
      { channel: 'zalo', timestamp: '1 giờ trước', summary: 'Hỏi lịch bảo trì định kỳ hệ thống' }
    ]
  }
];

export async function getCustomers(req: Request, res: Response) {
  try {
    const { channel, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (channel && channel !== 'all') {
        query.channel = channel;
      }
      if (search) {
        const q = String(search).trim();
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { channelUserId: { $regex: q, $options: 'i' } }
        ];
      }

      let list = await Customer.find(query).sort({ updatedAt: -1 }).lean();
      if (list.length === 0 && (!channel || channel === 'all') && !search) {
        await Customer.insertMany(sampleCustomers as any);
        list = await Customer.find(query).sort({ updatedAt: -1 }).lean();
      }

      return res.json({
        success: true,
        data: list.map((item: any) => ({
          ...item,
          id: item._id.toString()
        }))
      });
    }

    let memoryList = [...sampleCustomers];
    if (channel && channel !== 'all') {
      memoryList = memoryList.filter((c) => c.channel === channel);
    }
    if (search) {
      const q = String(search).toLowerCase();
      memoryList = memoryList.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.channelUserId.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, data: memoryList });
  } catch (error) {
    return sendInternalServerError(res, error, 'Get customer list');
  }
}

export async function getCustomerById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(id).lean();
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
      }
      return res.json({ success: true, data: { ...customer, id: customer._id.toString() } });
    }

    const found = sampleCustomers.find((c) => c.channelUserId === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
    }
    return res.json({ success: true, data: found });
  } catch (error) {
    return sendInternalServerError(res, error, 'Get customer by id');
  }
}

export async function updateCustomer(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { name, phone, email, address, tags, notes } = req.body;

    if (mongoose.connection.readyState === 1) {
      const updated = await Customer.findByIdAndUpdate(
        id,
        {
          $set: {
            ...(name ? { name } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(address !== undefined ? { address } : {}),
            ...(tags ? { tags } : {}),
            ...(notes ? { notes } : {})
          }
        },
        { returnDocument: 'after' }
      );

      return res.json({ success: true, data: updated });
    }

    return res.json({ success: true, message: 'Cập nhật thành công (Memory mode)' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Update customer');
  }
}

/**
 * Đồng bộ danh tính hội thoại đa kênh khi người dùng dùng nhiều nền tảng (Item 27)
 */
export async function mergeCustomerIdentities(req: Request, res: Response) {
  try {
    const { primaryCustomerId, secondaryCustomerId } = req.body;

    if (!primaryCustomerId || !secondaryCustomerId) {
      return res.status(400).json({ success: false, message: 'Thiếu ID khách hàng cần đồng bộ gộp.' });
    }

    if (mongoose.connection.readyState === 1) {
      const [primary, secondary] = await Promise.all([
        Customer.findById(primaryCustomerId),
        Customer.findById(secondaryCustomerId)
      ]);

      if (!primary || !secondary) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy một trong hai hồ sơ khách hàng.' });
      }

      // Hợp nhất tags, notes, lịch sử đơn hàng
      const mergedTags = [...new Set([...(primary.tags || []), ...(secondary.tags || [])])];
      const mergedNotes = [...new Set([...(primary.notes || []), ...(secondary.notes || [])])];
      const mergedHistory = [
        ...(primary.history || []),
        ...(secondary.history || []),
        {
          channel: secondary.channel,
          timestamp: 'Vừa xong',
          summary: `Đồng bộ hợp nhất từ kênh ${secondary.channel} (ID: ${secondary.channelUserId})`
        }
      ];

      primary.tags = mergedTags;
      primary.notes = mergedNotes;
      primary.history = mergedHistory;
      if (!primary.phone && secondary.phone) primary.phone = secondary.phone;
      if (!primary.email && secondary.email) primary.email = secondary.email;
      await primary.save();

      // Cập nhật lại các cuộc hội thoại cũ của secondary trỏ về primary
      await Conversation.updateMany(
        { 'customer.channelUserId': secondary.channelUserId },
        { $set: { customer: primary.toObject() } }
      );

      return res.json({
        success: true,
        message: `Đã đồng bộ hợp nhất dữ liệu người dùng đa kênh thành công!`,
        data: primary
      });
    }

    return res.json({ success: true, message: 'Đồng bộ thành công (Simulation)' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Merge customer identities');
  }
}
