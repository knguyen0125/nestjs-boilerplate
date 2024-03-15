import pino from 'pino';
import { Logger, PinoLogger } from 'nestjs-pino';
import { v4 } from 'uuid';

const logAsync = process.env.LOG_ASYNC === 'true';

/**
 * Pino logger instance
 *
 * NestJS-Pino doesn't support use of pino outside of HTTP context
 * Since we want to use pino in other parts of the application
 * we have to create our own instance
 */
export const pinoLoggerInstance = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      remove: true,
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["set-cookie"]',
        'res.headers.authorization',
        'res.headers.cookie',
        'res.headers["set-cookie"]',

        'req.body.password',

        'req.headers["sec-fetch-dest"]',
        'req.headers["sec-fetch-mode"]',
        'req.headers["sec-fetch-site"]',
        'req.headers["sec-fetch-user"]',

        'req.query',
        'req.params',
        'req.remotePort',
      ],
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination(
    logAsync
      ? {
          minLength: 4096,
          sync: false,
        }
      : {},
  ),
);

export const pinoHttp = {
  logger: pinoLoggerInstance,
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers['x-request-id'];
    if (existingID) return existingID;
    const id = v4();
    res.setHeader('X-Request-Id', id);
    return id;
  },
};

// Using this logger instance allow us to hook into the logger async local storage,
// which is useful for logging outside NestJS injection
export const logger = new Logger(
  new PinoLogger({
    pinoHttp,
  }),
  {},
);
