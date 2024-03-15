import pino from 'pino';

export const pinoLogger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({
    minLength: 4096,
    sync: false,
  }),
);
