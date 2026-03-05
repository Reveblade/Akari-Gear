import { body, param } from 'express-validator';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(slugRegex)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('subcategory').optional().trim(),
  body('images').optional().isArray(),
  body('images.*')
    .optional()
    .custom((v) => typeof v === 'string' && (v.startsWith('http') || v.startsWith('/uploads/')))
    .withMessage('Geçerli resim URL veya yolu gerekli'),
  body('stock').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty(),
  body('slug')
    .optional()
    .trim()
    .matches(slugRegex)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isMongoId(),
  body('subcategory').optional().trim(),
  body('images').optional().isArray(),
  body('images.*')
    .optional()
    .custom((v) => typeof v === 'string' && (v.startsWith('http') || v.startsWith('/uploads/')))
    .withMessage('Geçerli resim URL veya yolu gerekli'),
  body('stock').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
];

export const productIdValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];
