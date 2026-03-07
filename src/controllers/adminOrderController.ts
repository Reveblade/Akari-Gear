import { Response } from 'express'
import mongoose from 'mongoose'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { AuthRequest } from '../middleware/auth.js'

export async function listOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, code, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, parseInt(String(page), 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)))
    const skip = (pageNum - 1) * limitNum

    const filter: Record<string, unknown> = {}
    if (status && typeof status === 'string') filter.status = status

    if (code && typeof code === 'string') {
      const s = code.trim().replace(/^#/, '')
      if (s.length === 24 && mongoose.Types.ObjectId.isValid(s)) {
        filter._id = new mongoose.Types.ObjectId(s)
      } else if (s.length >= 6) {
        const len = Math.min(8, s.length)
        const suffix = s.slice(-len).toLowerCase()
        const idStr = { $toString: '$_id' }
        filter.$expr = {
          $eq: [
            { $toLower: { $substr: [idStr, { $subtract: [{ $strLenCP: idStr }, len] }, -1] } },
            suffix,
          ],
        }
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .populate('user', 'email')
        .populate({ path: 'items.product', select: 'name slug images' })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ])

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (err) {
    console.error('Admin list orders error:', err)
    res.status(500).json({ error: 'Siparişler yüklenemedi' })
  }
}

export async function getOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz sipariş ID' })
      return
    }

    const order = await Order.findById(id)
      .populate('user', 'email')
      .populate({ path: 'items.product', select: 'name slug images stock' })
      .lean()

    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' })
      return
    }

    res.json({ order })
  } catch (err) {
    console.error('Admin get order error:', err)
    res.status(500).json({ error: 'Sipariş yüklenemedi' })
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz sipariş ID' })
      return
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Geçerli durum: pending, paid, shipped, delivered, cancelled' })
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' })
      return
    }

    const previousStatus = order.status
    const stockWasDeducted = ['paid', 'shipped', 'delivered'].includes(previousStatus)

    if (status === 'paid' && previousStatus === 'pending') {
      // Stoktan düş (sadece pending -> paid geçişinde, tek sefer)
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      }
    } else if ((status === 'pending' || status === 'cancelled') && stockWasDeducted) {
      // İptal veya beklemede'ye geri alındığında stoğa geri ekle
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      }
    }

    order.status = status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
    await order.save()

    const populated = await Order.findById(order._id)
      .populate('user', 'email')
      .populate({ path: 'items.product', select: 'name slug images' })
      .lean()

    res.json({ order: populated })
  } catch (err) {
    console.error('Admin update order error:', err)
    res.status(500).json({ error: 'Sipariş güncellenemedi' })
  }
}

export async function applyDiscount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { discountPercent } = req.body

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz sipariş ID' })
      return
    }

    const percent = typeof discountPercent === 'number'
      ? discountPercent
      : parseFloat(String(discountPercent || 0))

    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      res.status(400).json({ error: 'İndirim oranı 0-100 arasında olmalıdır' })
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' })
      return
    }

    const originalTotal = order.subtotalTry + order.shippingCostTry
    const discountAmount = originalTotal * (percent / 100)
    order.discountPercent = percent
    order.totalTry = Math.round((originalTotal - discountAmount) * 100) / 100
    await order.save()

    const populated = await Order.findById(order._id)
      .populate('user', 'email')
      .populate({ path: 'items.product', select: 'name slug images' })
      .lean()

    res.json({ order: populated })
  } catch (err) {
    console.error('Admin apply discount error:', err)
    res.status(500).json({ error: 'İndirim uygulanamadı' })
  }
}

export async function deleteOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Geçersiz sipariş ID' })
      return
    }

    const order = await Order.findById(id)
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' })
      return
    }

    const stockWasDeducted = ['paid', 'shipped', 'delivered'].includes(order.status)
    if (stockWasDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      }
    }

    await Order.findByIdAndDelete(id)
    res.json({ message: 'Sipariş silindi' })
  } catch (err) {
    console.error('Admin delete order error:', err)
    res.status(500).json({ error: 'Sipariş silinemedi' })
  }
}
