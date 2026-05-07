const app = require('./app');
const { logger } = require('./middleware/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    healthcheck: `http://localhost:${PORT}/healthcheck`,
  });
});