import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';

export async function listProducts(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { category, search, page = 1, limit = 20, active } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};
    if (active !== 'false') query.isActive = true;
    if (category) query.category = category;
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
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

    res.json({ product });
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
    await product.populate('category', 'name slug');
    res.status(201).json({ product });
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
    ).populate('category', 'name slug');

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
