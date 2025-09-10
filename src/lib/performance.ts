import { logger } from './logger';

export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(name: string) {
    const startTime = performance.now();
    this.timers.set(name, startTime);
    logger.debug('Performance: Timer started', { timerName: name });
  }

  static endTimer(name: string) {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.timers.delete(name);
      logger.info('Performance: Timer completed', { timerName: name, duration: `${duration.toFixed(2)}ms` });
      return duration;
    }
    logger.warn('Performance: Timer not found', { timerName: name });
    return null;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => this.endTimer(name));
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      return fn();
    } finally {
      this.endTimer(name);
    }
  }
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', event.reason, {
    promise: 'unhandled_rejection',
    url: window.location.href
  });
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  logger.error('Global JavaScript Error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href
  });
});