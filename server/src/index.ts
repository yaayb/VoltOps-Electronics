import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import { orderRouter } from './routes/order.routes';
import { serialRouter } from './routes/serial.routes';
import { rmaRouter } from './routes/rma.routes';
import { settingsRouter } from './routes/settings.routes';
import { errorHandler } from './middleware/error.middleware';

export const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'VoltOps Cloud API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/serials', serialRouter);
app.use('/api/rma', rmaRouter);
app.use('/api/settings', settingsRouter);

app.use(errorHandler);

const PORT = Number.parseInt(process.env.PORT || '5000', 10);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡ VoltOps Cloud REST API listening on http://localhost:${PORT}`);
  });
}
