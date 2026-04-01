import express from 'express';
import { createCategory, getCategories } from './categories.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authMiddleware, adminMiddleware, createCategory);

export default router;
