import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { getLatestExchangeRate } from '../services/exchangeRateCache.js';
import { usdToTryRoundUp } from '../utils/currency.js';
import { AuthRequest } from '../middleware/auth.js';

function withTryPrices<T extends { price: number }>(
  items: T[],
  rate: number
): (T & { priceTry: number })[] {
  return items.map((item) => ({
    ...item,
    priceTry: usdToTryRoundUp(item.price, rate),
  }));
}

export async function listProducts(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { category, subcategory, search, featured, page = 1, limit = 20, active, inactive, sort } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};
    if (inactive === 'true') {
      query.isActive = false;
    } else if (active !== 'false') {
      query.isActive = true;
    }
    if (featured === 'true') query.isFeatured = true;
    if (category) query.category = category;
    if (subcategory && typeof subcategory === 'string') query.subcategory = subcategory;
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap: Record<string, { [k: string]: 1 | -1 }> = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      name: { name: 1 },
    };
    const sortOpt = (typeof sort === 'string' && sortMap[sort]) ? sortMap[sort] : { createdAt: -1 };

    const currency = req.query.currency as string | undefined;
    const wantTry = currency?.toUpperCase() === 'TRY';

    const [products, total, exchangeRate] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOpt as { [key: string]: 1 | -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
      wantTry ? getLatestExchangeRate() : null,
    ]);

    let payload: unknown = products;
    let rateInfo: { usdToTry: number; date: Date } | undefined;

    if (wantTry && exchangeRate) {
      payload = withTryPrices(products as { price: number }[], exchangeRate.usdToTry);
      rateInfo = { usdToTry: exchangeRate.usdToTry, date: exchangeRate.date };
    }

    res.json({
      products: payload,
      ...(rateInfo && { exchangeRate: rateInfo }),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProduct(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { slug } = req.params;
    const filter: Record<string, unknown> =
      mongoose.Types.ObjectId.isValid(slug) && slug.length === 24
        ? { _id: slug }
        : { slug };
    if (req.user?.role !== 'admin') filter.isActive = true;

    const product = await Product.findOne(filter)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const currency = req.query.currency as string | undefined;
    const wantTry = currency?.toUpperCase() === 'TRY';

    let payload: Record<string, unknown> = product as Record<string, unknown>;
    if (wantTry) {
      const rate = await getLatestExchangeRate();
      if (rate) {
        payload = {
          ...product,
          priceTry: usdToTryRoundUp(product.price, rate.usdToTry),
          exchangeRate: { usdToTry: rate.usdToTry, date: rate.date },
        };
      }
    }

    res.json({ product: payload });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function createProduct(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const product = await Product.create(req.body);
    const populated = await Product.findById(product._id)
      .populate('category', 'name slug')
      .lean();
    res.status(201).json({ product: populated });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function deleteProduct(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}
