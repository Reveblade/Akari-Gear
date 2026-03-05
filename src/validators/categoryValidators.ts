import { body, param } from 'express-validator';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(slugRegex)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('description').optional().trim(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

export const updateCategoryValidator = [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().trim().notEmpty(),
  body('slug')
    .optional()
    .trim()
    .matches(slugRegex)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('description').optional().trim(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

export const categoryIdValidator = [
  param('id').isMongoId().withMessage('Invalid category ID'),
];
