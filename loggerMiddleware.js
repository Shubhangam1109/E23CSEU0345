const { Log } = require('./logging');

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const url = req.originalUrl || req.url;
  const method = req.method;

  Log('backend', 'info', 'handler', `Incoming request: ${method} ${url}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    Log('backend', 'info', 'handler', `Completed ${method} ${url} with ${res.statusCode} in ${duration}ms`);
  });

  next();
};

module.exports = loggerMiddleware;
