import { Request, Response } from 'express';
import prisma from '../../config/prisma.js';

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, type, config, billingCycles, categoryId } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
          name,
          description,
          price: parseFloat(price as string),
          type,
          config,
          billingCycles,
          categoryId: parseInt(categoryId as string)
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, type, config, billingCycles, categoryId } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id as string) },
      data: {
          name,
          description,
          price: parseFloat(price as string),
          type,
          config,
          billingCycles,
          categoryId: parseInt(categoryId as string)
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: parseInt(id as string) } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
