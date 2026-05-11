const LOG_SERVER_URL = 'http://4.224.186.213/evaluation-service/logs';

const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const BACKEND_ONLY_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service'
];
const FRONTEND_ONLY_PACKAGES = [
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style'
];
const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

const normalizeString = (value) => String(value || '').trim().toLowerCase();

const validateLogPayload = (stack, level, packageName, message) => {
  const normalizedStack = normalizeString(stack);
  const normalizedLevel = normalizeString(level);
  const normalizedPackage = normalizeString(packageName);
  const normalizedMessage = String(message || '').trim();

  if (!VALID_STACKS.includes(normalizedStack)) {
    throw new Error(`Invalid stack value: ${stack}`);
  }
  if (!VALID_LEVELS.includes(normalizedLevel)) {
    throw new Error(`Invalid level value: ${level}`);
  }

  const permittedPackages = normalizedStack === 'frontend'
    ? [...FRONTEND_ONLY_PACKAGES, ...SHARED_PACKAGES]
    : [...BACKEND_ONLY_PACKAGES, ...SHARED_PACKAGES];

  if (!permittedPackages.includes(normalizedPackage)) {
    throw new Error(`Invalid package value for ${normalizedStack} stack: ${packageName}`);
  }
  if (!normalizedMessage) {
    throw new Error('Message cannot be empty');
  }

  return {
    stack: normalizedStack,
    level: normalizedLevel,
    package: normalizedPackage,
    message: normalizedMessage
  };
};

const log = async (stack, level, packageName, message) => {
  const payload = validateLogPayload(stack, level, packageName, message);

  try {
    await fetch(LOG_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Logging failed:', error.message);
  }
};

module.exports = {
  Log: log
};
