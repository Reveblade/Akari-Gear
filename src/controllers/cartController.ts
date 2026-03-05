import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { usdToTryRoundUp } from '../utils/currency.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug price images',
        populate: { path: 'category', select: 'name slug' },
      })
      .lean();

    if (!cart) {
      res.json({ cart: { items: [] } });
      return;
    }

    const currency = req.query.currency as string | undefined;
    const wantTry = currency?.toUpperCase() === 'TRY';

    const rawItems = cart.items.filter((i) => i.product != null);
    const rate = wantTry ? await ExchangeRate.findOne().sort({ date: -1 }).lean() : null;

    const items = rawItems.map((i) => {
      const p = i.product as unknown as { _id: string; name: string; slug: string; price: number };
      if (!p || typeof p !== 'object' || !('name' in p)) return null;
      const product: Record<string, unknown> = { ...p };
      if (rate) {
        product.priceTry = usdToTryRoundUp(p.price, rate.usdToTry);
      }
      return { product, quantity: i.quantity };
    }).filter(Boolean);

    res.json({ cart: { items } });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ error: 'Valid product ID required' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (existingIdx >= 0) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (product.stock < newQty) {
        res.status(400).json({ error: 'Insufficient stock' });
        return;
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({ product: productId as mongoose.Types.ObjectId, quantity });
    }

    await cart.save();

    const updated = await Cart.findById(cart._id)
      .populate({ path: 'items.product', select: 'name slug price' })
      .lean();

    res.json({ cart: updated });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
}

export async function updateCartItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ error: 'Valid product ID required' });
      return;
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      res.status(400).json({ error: 'Quantity must be at least 1' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      res.status(404).json({ error: 'Item not in cart' });
      return;
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
}

export async function removeFromCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ error: 'Valid product ID required' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.json({ message: 'Item removed' });
      return;
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
}
