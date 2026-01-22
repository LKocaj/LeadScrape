import { initDatabase, closeDatabase } from '../../../src/storage/sqlite.client.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;

async function main() {
  console.log('Initializing database...');
  await initDatabase();
  console.log('Database initialized');

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await closeDatabase();
    process.exit(0);
  });
}

main().catch(console.error);
