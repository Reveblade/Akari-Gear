import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { usdToTryRoundUp } from '../utils/currency.js';
import { AuthRequest } from '../middleware/auth.js';

interface OrderAddressBody {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  postalCode?: string;
}

function validateAddress(addr: unknown): addr is OrderAddressBody {
  if (!addr || typeof addr !== 'object') return false;
  const a = addr as Record<string, unknown>;
  return (
    typeof a.fullName === 'string' && a.fullName.trim().length > 0 &&
    typeof a.phone === 'string' && a.phone.trim().length > 0 &&
    typeof a.city === 'string' && a.city.trim().length > 0 &&
    typeof a.district === 'string' && a.district.trim().length > 0 &&
    typeof a.neighborhood === 'string' && a.neighborhood.trim().length > 0 &&
    typeof a.address === 'string' && a.address.trim().length > 0
  );
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { address } = req.body;

    if (!validateAddress(address)) {
      res.status(400).json({
        error: 'Geçerli adres bilgisi gerekli',
        details: 'fullName, phone, city, district, neighborhood, address alanları zorunludur',
      });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate({ path: 'items.product', select: 'name slug price stock isActive' })
      .lean();

    if (!cart || !cart.items.length) {
      res.status(400).json({ error: 'Sepetiniz boş' });
      return;
    }

    const rate = await ExchangeRate.findOne().sort({ date: -1 }).lean();
    if (!rate) {
      res.status(503).json({ error: 'Döviz kuru yüklenemedi. Lütfen daha sonra tekrar deneyin.' });
      return;
    }

    const orderItems: Array<{
      product: mongoose.Types.ObjectId;
      name: string;
      slug: string;
      quantity: number;
      unitPriceUsd: number;
      unitPriceTry: number;
      subtotalTry: number;
    }> = [];
    let subtotalTry = 0;

    for (const ci of cart.items) {
      const raw = ci.product as unknown;
      if (!raw || typeof raw !== 'object' || !('name' in raw) || !('price' in raw)) continue;
      const p = raw as { _id: mongoose.Types.ObjectId; name: string; slug: string; price: number; stock: number; isActive?: boolean };
      if (!p.isActive) {
        res.status(400).json({ error: `"${p.name}" ürünü artık satışta değil` });
        return;
      }
      if (p.stock < ci.quantity) {
        res.status(400).json({ error: `"${p.name}" için yeterli stok yok (stok: ${p.stock})` });
        return;
      }

      const unitPriceTry = usdToTryRoundUp(p.price, rate.usdToTry);
      const subtotalItem = unitPriceTry * ci.quantity;
      subtotalTry += subtotalItem;

      orderItems.push({
        product: p._id,
        name: p.name,
        slug: p.slug,
        quantity: ci.quantity,
        unitPriceUsd: p.price,
        unitPriceTry,
        subtotalTry: subtotalItem,
      });
    }

    if (orderItems.length === 0) {
      res.status(400).json({ error: 'Sepetinizde geçerli ürün bulunamadı' });
      return;
    }

    const shippingCostTry = 0; // TODO: kargo hesaplama
    const totalTry = subtotalTry + shippingCostTry;

    const order = await Order.create({
      user: req.user._id,
      address: {
        fullName: (address as OrderAddressBody).fullName.trim(),
        phone: (address as OrderAddressBody).phone.trim(),
        city: (address as OrderAddressBody).city.trim(),
        district: (address as OrderAddressBody).district.trim(),
        neighborhood: (address as OrderAddressBody).neighborhood.trim(),
        address: (address as OrderAddressBody).address.trim(),
        postalCode: ((address as OrderAddressBody).postalCode ?? '').trim() || undefined,
      },
      items: orderItems,
      subtotalTry,
      shippingCostTry,
      totalTry,
      status: 'pending',
      exchangeRateUsdToTry: rate.usdToTry,
      exchangeRateDate: rate.date,
    });

    // Sepeti temizle
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    const populated = await Order.findById(order._id)
      .populate({ path: 'items.product', select: 'name slug images' })
      .lean();

    res.status(201).json({ order: populated });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Sipariş oluşturulamadı' });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate({ path: 'items.product', select: 'name slug images' })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ user: req.user._id }),
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
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Siparişler yüklenemedi' });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ error: 'Geçersiz sipariş ID' });
      return;
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate({ path: 'items.product', select: 'name slug images' })
      .lean();

    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' });
      return;
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Sipariş yüklenemedi' });
  }
}
