const fastify = require('fastify')({ logger: true });
const scanner = require('./scanner');

// Root info
fastify.get('/', async (request, reply) => {
  return { 
    project: 'ClawdShield', 
    version: '1.0.0', 
    status: 'online',
    vision: 'Safe Agent-to-Agent Economy'
  };
});

// Scan endpoint
fastify.post('/api/scan', async (request, reply) => {
  const { content } = request.body || {};
  
  if (!content) {
    return reply.status(400).send({ error: 'Field "content" is required.' });
  }

  const result = scanner.scan(content);
  return result;
});

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`ClawdShield Gateway running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
