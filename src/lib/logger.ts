type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = error instanceof Error 
      ? { ...context, error: error.message, stack: error.stack }
      : { ...context, error };
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Method to log API calls (sanitized)
  apiCall(method: string, endpoint: string, data?: any) {
    const sanitizedData = this.sanitizeLogData(data);
    this.info(`API ${method.toUpperCase()} ${endpoint}`, { data: sanitizedData });
  }

  // Method to log API responses (sanitized)
  apiResponse(method: string, endpoint: string, status: number, data?: any) {
    const sanitizedData = this.sanitizeLogData(data);
    this.info(`API ${method.toUpperCase()} ${endpoint} - ${status}`, { response: sanitizedData });
  }

  // Sanitize sensitive data from logs
  private sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'phone', 'email', 'address'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  // Method to log user actions
  userAction(action: string, details?: LogContext) {
    this.info(`User Action: ${action}`, details);
  }

  // Method to log state changes
  stateChange(component: string, state: string, data?: any) {
    this.debug(`State Change: ${component} - ${state}`, { data });
  }
}

export const logger = new Logger();