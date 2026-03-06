import { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { AuthRequest } from '../middleware/auth.js';

export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', search = '', role = '' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (role && typeof role === 'string' && ['customer', 'admin'].includes(role)) {
      filter.role = role;
    }
    if (search && typeof search === 'string' && search.trim()) {
      filter.email = { $regex: search.trim(), $options: 'i' };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerificationToken -resetPasswordToken -twoFactorCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Üyeler yüklenemedi' });
  }
}

export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      return;
    }

    const user = await User.findById(id)
      .select('-password -emailVerificationToken -resetPasswordToken -twoFactorCode')
      .lean();

    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Admin get user error:', err);
    res.status(500).json({ error: 'Kullanıcı yüklenemedi' });
  }
}

export async function blockUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      return;
    }

    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    if (target.role === 'admin') {
      res.status(403).json({ error: 'Admin hesapları engellenemez' });
      return;
    }

    if (req.user?._id.toString() === id) {
      res.status(400).json({ error: 'Kendinizi engelleyemezsiniz' });
      return;
    }

    target.isBlocked = true;
    await target.save();

    res.json({ message: 'Kullanıcı engellendi', user: target });
  } catch (err) {
    console.error('Admin block user error:', err);
    res.status(500).json({ error: 'Engelleme başarısız' });
  }
}

export async function unblockUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      return;
    }

    const target = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    if (!target) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    res.json({ message: 'Kullanıcı engeli kaldırıldı', user: target });
  } catch (err) {
    console.error('Admin unblock user error:', err);
    res.status(500).json({ error: 'Engel kaldırma başarısız' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      return;
    }

    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    if (target.role === 'admin') {
      res.status(403).json({ error: 'Admin hesapları silinemez' });
      return;
    }

    if (req.user?._id.toString() === id) {
      res.status(400).json({ error: 'Kendinizi silemezsiniz' });
      return;
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Silme başarısız' });
  }
}

export async function getUserOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      return;
    }

    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: id })
        .sort({ createdAt: -1 })
        .populate({ path: 'items.product', select: 'name slug images' })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ user: id }),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Admin get user orders error:', err);
    res.status(500).json({ error: 'Siparişler yüklenemedi' });
  }
}
