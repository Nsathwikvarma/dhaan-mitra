import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { seedDatabase } from './seed.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Seed database on first run if empty
if (db.find('farmers').length === 0) {
  console.log('🌱 Initializing database with seed demo data...');
  seedDatabase();
}

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    application: 'Dhaan Mitra - Smart Farmer Procurement Slot Booking & Grain Quality System',
    problemStatement: 'SIH 26032',
    timestamp: new Date().toISOString()
  });
});

// Dist paths
const adminDistPath = path.join(__dirname, '../admin-web/dist');
const mobileDistPath = path.join(__dirname, '../mobile-app/dist');

// Helper to send mobile SPA index
const sendMobile = (res) => {
  const p = path.join(mobileDistPath, 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(503).send('Mobile app not built yet. Run: npm run build:mobile');
};

// Helper to send admin SPA index
const sendAdmin = (res) => {
  const p = path.join(adminDistPath, 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(503).send('Admin app not built yet. Run: npm run build:admin');
};

// ------------------------------------------------------------------
// 👨‍🌾 FARMER PORTAL  →  /farmer
// ------------------------------------------------------------------
app.use('/farmer', express.static(mobileDistPath));
app.get('/farmer', (_req, res) => sendMobile(res));
app.get('/farmer/*', (_req, res) => sendMobile(res));

// ------------------------------------------------------------------
// 🏬 PROCURER PORTAL  →  /procurer
// ------------------------------------------------------------------
app.use('/procurer', express.static(mobileDistPath));
app.get('/procurer', (_req, res) => sendMobile(res));
app.get('/procurer/*', (_req, res) => sendMobile(res));

// ------------------------------------------------------------------
// 🛡️ ADMIN PORTAL  →  /admin
// ------------------------------------------------------------------
app.use('/admin', express.static(adminDistPath));
app.get('/admin', (_req, res) => sendAdmin(res));
app.get('/admin/*', (_req, res) => sendAdmin(res));

// Legacy /mobile route (backward compat)
app.use('/mobile', express.static(mobileDistPath));
app.get('/mobile/*', (_req, res) => sendMobile(res));

// Root → Admin portal (also backward compat)
app.use(express.static(adminDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Endpoint not found' });
  sendAdmin(res);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Dhaan Mitra Server  →  http://localhost:${PORT}`);
  console.log(`\n   🌐 Portals:`);
  console.log(`      👨‍🌾  Farmer Portal   : http://localhost:${PORT}/farmer`);
  console.log(`      🏬  Procurer Portal : http://localhost:${PORT}/procurer`);
  console.log(`      🛡️   Admin Portal    : http://localhost:${PORT}/admin`);
  console.log(`\n   📡 API Health        : http://localhost:${PORT}/api/health\n`);
});
