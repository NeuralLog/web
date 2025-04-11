# Handling Async Cleanup in React Components

This document explains how to properly handle asynchronous cleanup in React components, particularly in the `useEffect` hook's cleanup function.

## The Problem

When using `useEffect` in React, you can return a cleanup function that runs when the component unmounts or before the effect runs again. However, this cleanup function cannot be async:

```typescript
// This is NOT allowed and will cause issues
useEffect(() => {
  // Effect code...
  
  return async () => {
    // Async cleanup code...
    await someAsyncFunction();
  };
}, []);
```

React expects the cleanup function to either return nothing or return a function. If you return a Promise (which is what async functions do), React won't handle it correctly.

## Solutions

Here are several approaches to handle async cleanup in React components:

### 1. Use a Synchronous Version of the Cleanup Function

The best approach is to create a synchronous version of your cleanup function:

```typescript
// In your service file
export const clearResourcesAsync = async (): Promise<void> => {
  // Async cleanup logic
  await someAsyncOperation();
}

export const clearResourcesSync = (): void => {
  // Synchronous cleanup logic
  // This might not do everything the async version does,
  // but it should handle the most critical parts
}

// In your component
useEffect(() => {
  // Effect code...
  
  return () => {
    // Use the synchronous version for cleanup
    clearResourcesSync();
  };
}, []);
```

### 2. Use `void` to Ignore the Promise

If you can't create a synchronous version, you can use `void` to tell TypeScript to ignore the Promise:

```typescript
useEffect(() => {
  // Effect code...
  
  return () => {
    // Use void to ignore the Promise
    try {
      void clearResourcesAsync();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };
}, []);
```

This approach doesn't wait for the async operation to complete, but it at least starts the cleanup process.

### 3. Use a Ref to Track Component Mount State

For more complex scenarios, you can use a ref to track whether the component is still mounted:

```typescript
function MyComponent() {
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Effect code...
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const cleanup = async () => {
      try {
        await someAsyncOperation();
        // Only update state if the component is still mounted
        if (isMounted.current) {
          // Update state or perform other operations
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
    
    return () => {
      // Start the cleanup process but don't await it
      void cleanup();
    };
  }, []);
}
```

## Best Practices

1. **Prefer Synchronous Cleanup**: Whenever possible, create synchronous versions of your cleanup functions.

2. **Handle Critical Resources First**: In your synchronous cleanup, prioritize releasing critical resources (like memory) that could cause leaks.

3. **Use Try/Catch**: Always wrap your cleanup code in try/catch blocks to prevent unhandled exceptions.

4. **Consider Component Lifecycle**: Be aware that the component might be unmounted by the time an async operation completes.

5. **Avoid State Updates After Unmount**: Never update state in a component that has been unmounted.

## Example: Tenant Context Cleanup

Here's how we handle tenant context cleanup in our application:

```typescript
// In tenantContext.ts
export const clearTenantContext = async (): Promise<void> => {
  try {
    // Clear the cache
    cachedTenantId = null;

    // Remove from Redis (async operation)
    const redis = getRedisClient();
    await redis.del(TENANT_ID_KEY);
  } catch (error) {
    console.error('Error clearing tenant context:', error);
  }
}

export const clearTenantContextSync = (): void => {
  try {
    // Clear the cache (synchronous operation)
    cachedTenantId = null;
    
    // Note: We can't clear Redis synchronously, but that's usually fine for cleanup
    // The cache is the most important part to clear
  } catch (error) {
    console.error('Error clearing tenant context synchronously:', error);
  }
}

// In TenantProvider.tsx
useEffect(() => {
  // Effect code...
  
  return () => {
    // Use the synchronous version for cleanup
    try {
      clearTenantContextSync();
    } catch (error) {
      console.error('Error clearing tenant context:', error);
    }
  };
}, []);
```

## Conclusion

Handling async cleanup in React requires careful consideration of the component lifecycle and the nature of the resources being cleaned up. By following the approaches outlined in this document, you can ensure that your components clean up properly without causing errors or memory leaks.
