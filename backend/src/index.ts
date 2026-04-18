import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import productRoutes from './modules/products/products.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import serviceRoutes from './modules/services/services.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import adminSettingsRoutes from './modules/admin/settings.routes.js';
import infrastructureRoutes from './modules/admin/infrastructure.routes.js';
import emailAdminRoutes from './modules/admin/email.routes.js';
import webhookRoutes from './webhook.js';
import { startAutomation } from './services/automation.service.js';
import './services/email.worker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Webhook must be before express.json() for raw body
app.use('/api/webhooks/stripe', webhookRoutes);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/infrastructure', infrastructureRoutes);
app.use('/api/admin/email', emailAdminRoutes);

app.get('/health', (req, res) => { res.json({ status: 'ok' }); });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startAutomation();
});

export default app;
