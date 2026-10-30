// FILE: src/lib/logger.ts
import pino from 'pino';

// 生产环境下输出单行标准 JSON 格式，开发环境下使用 pino-pretty 进行可读的美化输出
const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  transport: !isProd
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});
