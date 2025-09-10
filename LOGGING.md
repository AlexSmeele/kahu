# Comprehensive Logging System

This application now includes a robust logging system to help with debugging and monitoring. Here's how it works:

## Logger Utility (`src/lib/logger.ts`)

The centralized logger provides different log levels and specialized methods:

### Log Levels
- **DEBUG**: Development-only detailed information (filtered out in production)
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages with full context

### Specialized Methods
- `logger.apiCall(method, endpoint, data)` - Log API requests
- `logger.apiResponse(method, endpoint, status, data)` - Log API responses
- `logger.userAction(action, details)` - Log user interactions
- `logger.stateChange(component, state, data)` - Log state changes

## Areas Covered

### 1. Authentication (`src/contexts/AuthContext.tsx`)
- User signup/signin attempts and results
- Auth state changes
- Session management

### 2. Dog Management (`src/hooks/useDogs.ts`)
- Dog CRUD operations
- Photo uploads
- Global state synchronization
- API calls and responses

### 3. Health Data (`src/hooks/useHealthData.ts`)
- Data fetching operations
- Weight, vaccination, and vet visit tracking

### 4. Activity Tracking (`src/hooks/useActivity.ts`)
- Activity goals and records
- Progress calculations
- Goal creation and updates

### 5. Main App Navigation (`src/pages/Index.tsx`)
- Tab changes
- Screen rendering
- Dog selection
- User typing states

### 6. App Initialization (`src/App.tsx`)
- React Query error handling
- App startup

### 7. Error Handling (`src/components/ErrorBoundary.tsx`)
- React component errors
- Error boundary catches

### 8. Global Error Handling (`src/lib/performance.ts`)
- Unhandled promise rejections
- JavaScript runtime errors
- Performance monitoring

## Usage Examples

```typescript
// Basic logging
logger.info('User logged in', { userId: user.id });
logger.error('Failed to save data', error, { context: 'user_profile' });

// API logging
logger.apiCall('POST', '/dogs', dogData);
logger.apiResponse('POST', '/dogs', 201, { dogId: newDog.id });

// User actions
logger.userAction('tabChange', { from: 'health', to: 'nutrition' });

// State changes
logger.stateChange('useDogs', 'dogsUpdated', { dogCount: 3 });

// Performance monitoring
PerformanceMonitor.measureAsync('fetchUserData', async () => {
  return await api.getUserData();
});
```

## Log Format

All logs include:
- Timestamp (ISO format)
- Log level
- Message
- Context object (when provided)

Example:
```
[2025-01-10T14:30:25.123Z] [INFO] useDogs: Fetching dogs for user | Context: {"userId":"123"}
```

## Debugging Tips

1. **Check Console**: All logs appear in browser dev tools
2. **Filter by Component**: Search logs by component name (e.g., "useDogs", "AuthProvider")
3. **Track User Actions**: Look for "User Action:" entries to trace user behavior
4. **API Issues**: Search for "API" to see all API calls and responses
5. **State Changes**: Search for "State Change:" to track component state updates

## Development vs Production

- DEBUG logs only appear in development mode
- Production logs focus on INFO, WARN, and ERROR levels
- All errors are logged regardless of environment

This logging system provides comprehensive visibility into the application's behavior, making debugging and monitoring much more effective.