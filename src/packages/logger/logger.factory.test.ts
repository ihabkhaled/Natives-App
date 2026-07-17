import { afterEach, describe, expect, it, vi } from 'vitest';

import { createConsoleSink, createLogger, type LoggerSink } from './logger.factory';
import { LOG_LEVEL, type LogLevel } from './logger.types';

function spyOnConsole() {
  return {
    info: vi.spyOn(console, 'info').mockImplementation(() => undefined),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => undefined),
    error: vi.spyOn(console, 'error').mockImplementation(() => undefined),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createConsoleSink', () => {
  it('routes error records to console.error', () => {
    const spies = spyOnConsole();

    createConsoleSink().write(LOG_LEVEL.Error, 'boom', { status: 500 });

    expect(spies.error).toHaveBeenCalledWith('boom', { status: 500 });
    expect(spies.warn).not.toHaveBeenCalled();
    expect(spies.info).not.toHaveBeenCalled();
  });

  it('routes warn records to console.warn', () => {
    const spies = spyOnConsole();

    createConsoleSink().write(LOG_LEVEL.Warn, 'careful', { status: 429 });

    expect(spies.warn).toHaveBeenCalledWith('careful', { status: 429 });
    expect(spies.error).not.toHaveBeenCalled();
  });

  it('routes info and debug records to console.info', () => {
    const spies = spyOnConsole();
    const sink = createConsoleSink();

    sink.write(LOG_LEVEL.Info, 'started', { port: 3000 });
    sink.write(LOG_LEVEL.Debug, 'details', { step: 1 });

    expect(spies.info).toHaveBeenNthCalledWith(1, 'started', { port: 3000 });
    expect(spies.info).toHaveBeenNthCalledWith(2, 'details', { step: 1 });
  });

  it('omits the fields argument entirely when there are no fields', () => {
    const spies = spyOnConsole();

    createConsoleSink().write(LOG_LEVEL.Info, 'plain', undefined);

    expect(spies.info).toHaveBeenCalledExactlyOnceWith('plain');
  });
});

describe('createLogger', () => {
  it('prefixes every level with the logger scope', () => {
    const write = vi.fn<LoggerSink['write']>();
    const sink: LoggerSink = { write };
    const logger = createLogger('http', sink);
    const emitByLevel: readonly (readonly [LogLevel, (message: string) => void])[] = [
      [LOG_LEVEL.Debug, logger.debug],
      [LOG_LEVEL.Info, logger.info],
      [LOG_LEVEL.Warn, logger.warn],
      [LOG_LEVEL.Error, logger.error],
    ];

    for (const [level, emit] of emitByLevel) {
      emit(`${level} happened`);
    }

    expect(write.mock.calls).toEqual([
      [LOG_LEVEL.Debug, '[http] debug happened', undefined],
      [LOG_LEVEL.Info, '[http] info happened', undefined],
      [LOG_LEVEL.Warn, '[http] warn happened', undefined],
      [LOG_LEVEL.Error, '[http] error happened', undefined],
    ]);
  });

  it('sanitizes fields before they reach the sink', () => {
    const write = vi.fn<LoggerSink['write']>();
    const logger = createLogger('auth', { write });

    logger.error('refresh failed', { refreshToken: 'refresh-1', attempt: 2 });

    expect(write).toHaveBeenCalledWith(LOG_LEVEL.Error, '[auth] refresh failed', {
      refreshToken: '[REDACTED]',
      attempt: 2,
    });
  });

  it('redacts credentials on the way to the console sink', () => {
    const spies = spyOnConsole();
    const logger = createLogger('auth', createConsoleSink());

    logger.info('login attempt', {
      email: 'user@example.com',
      password: 'hunter2',
      token: 'a.b.c',
    });

    expect(spies.info).toHaveBeenCalledExactlyOnceWith('[auth] login attempt', {
      email: 'user@example.com',
      password: '[REDACTED]',
      token: '[REDACTED]',
    });
  });

  it('keeps scopes isolated from each other', () => {
    const write = vi.fn<LoggerSink['write']>();
    const sink: LoggerSink = { write };

    createLogger('a', sink).info('ping');
    createLogger('b', sink).info('ping');

    expect(write).toHaveBeenNthCalledWith(1, LOG_LEVEL.Info, '[a] ping', undefined);
    expect(write).toHaveBeenNthCalledWith(2, LOG_LEVEL.Info, '[b] ping', undefined);
  });
});
