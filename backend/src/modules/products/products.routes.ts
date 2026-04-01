import express from 'express';
import { createProduct, getAllProducts, getProductById } from './products.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminMiddleware, createProduct);

export default router;
