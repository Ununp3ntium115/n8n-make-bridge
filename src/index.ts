import dotenv from 'dotenv';
import { ApiServer } from './api/server';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'N8N_BASE_URL',
  'N8N_API_KEY',
  'MAKE_API_TOKEN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create and start the server
const server = new ApiServer(
  process.env.N8N_BASE_URL!,
  process.env.N8N_API_KEY!,
  process.env.MAKE_API_TOKEN!,
  process.env.MAKE_REGION || 'eu1'
);

const port = parseInt(process.env.PORT || '3000', 10);
server.start(port);
