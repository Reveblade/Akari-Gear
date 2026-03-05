import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { AuthRequest } from '../middleware/auth.js';

export async function listCategories(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const activeOnly = req.query.active !== 'false';
    const query = activeOnly ? { isActive: true } : {};

    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    res.json({ categories });
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getCategory(
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

    const category = await Category.findOne(filter);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ category });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}

export async function createCategory(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function updateCategory(
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
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ category });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategory(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}
