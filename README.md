# @tsdiapi/prisma: Prisma Integration Plugin for TSDIAPI-Server

**@tsdiapi/prisma** seamlessly integrates **Prisma** with **TSDIAPI-Server**, providing hooks, events, and lifecycle management to enhance database operations.

---

## Features

- **Prisma Client Integration**: Automatically sets up and manages Prisma Client.
- **Event System**: Listen to events before and after Prisma operations.
- **Hook Support**: Dynamically modify queries using hooks.
- **Request Context**: Access Fastify request context in Prisma hooks for authentication and authorization.
- **Lifecycle Management**: Handles Prisma Client initialization and cleanup during app lifecycle.
- **Configurable Options**: Define query timeouts and load custom Prisma-related files via glob patterns.
- **Full TypeScript Support**: Complete type safety for all operations.

---

## Installation

```bash
npm install @tsdiapi/prisma
```

Or use the CLI to add the plugin:

```bash
tsdiapi plugins add prisma
```

### 📌 Code Generation

The **TSDIAPI-Prisma** plugin includes code generators to streamline the creation of Prisma event listeners and hooks. Use the `tsdiapi` CLI to generate these files automatically.

| Name    | Description                                                           |
| ------- | --------------------------------------------------------------------- |
| `event` | Generates a Prisma event listener for a specific model and operation. |
| `hook`  | Generates a Prisma hook to modify query arguments before execution.   |

#### 📌 Generate a Prisma Event Listener

This generator creates an event listener that triggers **before** and **after** a specified Prisma operation. It will prompt for:

- **Model Name** (e.g., `User`, `Post`)
- **Prisma Operation** (e.g., `FindUnique`, `Create`, `Update`)

Run the command:

```bash
tsdiapi generate prisma event
```

---

#### 📌 Generate a Prisma Hook

This generator creates a Prisma hook that allows **modification of query arguments** before execution. It will prompt for:

- **Model Name** (e.g., `User`, `Order`)
- **Prisma Operation** (e.g., `Create`, `Update`, `FindMany`)

Run the command:

```bash
tsdiapi generate prisma hook
```

✅ **Easily generate Prisma event listeners and hooks with just one command!**

---

## Usage

### Register the Plugin

Add the plugin to your **TSDIAPI-Server** setup:

```typescript
import { createApp } from "@tsdiapi/server";
import prismaPlugin from "@tsdiapi/prisma";
import { PrismaClient } from "@generated/prisma/client.js";

createApp({
  plugins: [
    prismaPlugin({
      client: PrismaClient,
      prismaOptions: {
        transactionOptions: { timeout: 15000 },
      },
    }),
  ],
});
```

**Note**: The `client` parameter is required and should be your generated Prisma client.

### Access Prisma Client

You can access the Prisma client in several ways:

**1. Via the `client` export:**
```typescript
import { client } from "@tsdiapi/prisma";

const users = await client.user.findMany();
console.log(users);
```

**2. Via the `usePrisma()` function (recommended):**
```typescript
import { usePrisma } from "@tsdiapi/prisma";
import { PrismaClient } from "@generated/prisma/client.js";

const prisma = usePrisma<PrismaClient>();
const users = await prisma.user.findMany();
console.log(users);
```

**3. Via Fastify instance decoration:**
```typescript
// Inside your route handlers or plugins
const users = await fastify.prisma.user.findMany();
```

---

## Event Handling

### Define Prisma Event Listeners

Use functions to respond to specific database events:

```typescript
import { onBeforeHook, onAfterHook, PrismaOperation } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";

// Listen to events before a query
onBeforeHook(Prisma.ModelName.User, PrismaOperation.Create, (payload) => {
  console.log(`Before creating user:`, payload.args);
});

// Listen to events after a query
onAfterHook(Prisma.ModelName.User, PrismaOperation.Create, (payload) => {
  console.log(`User created with ID: ${payload.result.id}`);
});
```

### Global Event Listeners for All Models (New in v0.3.5+)

Use `onBeforeHookForAll` and `onAfterHookForAll` for events across all models. Events are read-only and perfect for logging, monitoring, and analytics:

```typescript
import { onBeforeHookForAll, onAfterHookForAll, PrismaOperation, getRequest } from "@tsdiapi/prisma";
import { useSession } from "@tsdiapi/jwt-auth";

interface AuthSession {
  userId: string;
  email: string;
}

// Example 1: Simple logging for all Create operations
onBeforeHookForAll(PrismaOperation.Create, async (payload) => {
  console.log(`Creating ${payload.model}:`, payload.args);
});

// Example 2: Performance monitoring for all operations
const operationTimings = new Map<string, number>();

onBeforeHookForAll('*', (payload) => {
  const key = `${payload.model}_${payload.operation}_${Date.now()}`;
  operationTimings.set(key, Date.now());
});

onAfterHookForAll('*', (payload) => {
  const keys = Array.from(operationTimings.keys());
  const matchingKey = keys.find(k => 
    k.startsWith(`${payload.model}_${payload.operation}_`)
  );
  
  if (matchingKey) {
    const duration = Date.now() - operationTimings.get(matchingKey)!;
    if (duration > 1000) {
      console.warn(`Slow query: ${payload.model}.${payload.operation} took ${duration}ms`);
    }
    operationTimings.delete(matchingKey);
  }
});

// Example 3: Audit logging with user context
const mutationOps = [PrismaOperation.Create, PrismaOperation.Update, PrismaOperation.Delete];

mutationOps.forEach(op => {
  onAfterHookForAll(op, async (payload) => {
    const request = getRequest();
    const session = request ? useSession<AuthSession>(request) : null;
    
    // Log to audit table or external service
    await auditService.log({
      model: payload.model,
      operation: payload.operation,
      userId: session?.userId || 'system',
      userEmail: session?.email,
      ipAddress: request?.ip,
      data: JSON.stringify(payload.args),
      result: payload.result ? JSON.stringify(payload.result) : null,
      timestamp: new Date()
    });
  });
});

// Example 4: Conditional logging based on model
const sensitiveModels = ['User', 'Payment', 'Order'];

onAfterHookForAll('*', async (payload) => {
  if (sensitiveModels.includes(payload.model)) {
    const request = getRequest();
    const session = request ? useSession<AuthSession>(request) : null;
    
    console.log(`[SECURITY] ${session?.email || 'anonymous'} performed ${payload.operation} on ${payload.model}`);
  }
});

// Example 5: Error tracking and alerting
onAfterHookForAll('*', async (payload) => {
  // Check if operation failed (no result for mutations)
  const mutationOps = [PrismaOperation.Create, PrismaOperation.Update, PrismaOperation.Delete];
  
  if (mutationOps.includes(payload.operation) && !payload.result) {
    await errorTracking.capture({
      type: 'database_operation_failed',
      model: payload.model,
      operation: payload.operation,
      args: payload.args
    });
  }
});
```

Available functions:

- **`onBeforeHook(model, operation, handler)`**: Triggered before a Prisma query for specific model.
- **`onAfterHook(model, operation, handler)`**: Triggered after a query is executed for specific model.
- **`onBeforeHookForAll(operation, handler)`**: Triggered before operations across all models. Use `'*'` for all operations.
- **`onAfterHookForAll(operation, handler)`**: Triggered after operations across all models. Use `'*'` for all operations.

---

## Hook System

Modify queries dynamically using hooks:

```typescript
import { usePrismaHook, PrismaOperation } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";

// Register a hook to modify query arguments before execution
usePrismaHook(Prisma.ModelName.User, PrismaOperation.Create, async (args) => {
  // Modify the arguments before query execution
  args.data.name = `Modified-${args.data.name}`;
  args.data.createdAt = new Date();
  
  return args; // Return the modified query arguments
});

// Hooks can also be synchronous
usePrismaHook(Prisma.ModelName.User, PrismaOperation.Update, (args) => {
  args.data.updatedAt = new Date();
  return args;
});
```

The `usePrismaHook` function allows you to intercept and modify query arguments before they are executed by Prisma.

### Global Hooks for All Models (New in v0.3.5+)

Use `usePrismaHookForAll` to register hooks that apply to all models, perfect for cross-cutting concerns:

```typescript
import { usePrismaHookForAll, PrismaOperation } from "@tsdiapi/prisma";
import { useSession } from "@tsdiapi/jwt-auth";

interface AuthSession {
  userId: string;
  tenantId: string;
}

// Hook for all Create operations across all models
usePrismaHookForAll(PrismaOperation.Create, async (args, model, operation, request) => {
  console.log(`Creating ${model} with operation ${operation}`);
  
  if (request) {
    const session = useSession<AuthSession>(request);
    
    // Add metadata to all created records
    if (args.data && typeof args.data === 'object') {
      args.data.createdBy = session?.userId;
      args.data.createdAt = new Date();
    }
  }
  
  return args;
});

// Hook for ALL operations across ALL models
usePrismaHookForAll('*', async (args, model, operation, request) => {
  console.log(`Prisma operation: ${model}.${operation}`);
  
  // Example: Block certain models for non-admin users
  const session = request ? useSession<AuthSession>(request) : null;
  const restrictedModels = ['AdminSettings', 'SystemConfig'];
  
  if (restrictedModels.includes(model) && !session?.roles?.includes('admin')) {
    throw new Error(`Access denied to ${model}`);
  }
  
  return args;
});

// Example: Add tenant isolation to all models
const tenantEnabledModels = ['User', 'Post', 'Order'];

usePrismaHookForAll(PrismaOperation.FindMany, async (args, model, operation, request) => {
  if (tenantEnabledModels.includes(model)) {
    const session = request ? useSession<AuthSession>(request) : null;
    
    if (session?.tenantId) {
      args.where = {
        ...args.where,
        tenantId: session.tenantId
      };
    }
  }
  
  return args;
});
```

**Benefits of Global Hooks:**
- Apply common logic across all models (auditing, soft delete, multi-tenancy)
- Conditional logic based on model name
- Reduce code duplication
- Centralized security and authorization

### Request Context in Hooks (New in v0.3.5+)

> **Note**: This feature requires no changes to existing code. All existing hooks continue to work as before. The request parameter is optional.

> **Integration with @tsdiapi/jwt-auth**: The examples below demonstrate integration with the `@tsdiapi/jwt-auth` plugin for authentication. You can use any authentication method - the request object provides full access to Fastify's request context.

Hooks can now access the current Fastify request context, enabling advanced features like user-based filtering, authorization, and request-specific logging:

```typescript
import { usePrismaHook, PrismaOperation } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";
import { useSession } from "@tsdiapi/jwt-auth";

// Access request context in hooks
usePrismaHook(Prisma.ModelName.User, PrismaOperation.Create, async (args, request) => {
  // request is the current Fastify request (if available)
  if (request) {
    // Get authenticated session
    const session = useSession<AuthSession>(request);
    
    // Add user ID from authenticated session
    args.data.createdBy = session?.userId;
    
    // Add request metadata
    args.data.ipAddress = request.ip;
    args.data.userAgent = request.headers['user-agent'];
  }
  
  return args;
});

// Use request for authorization
usePrismaHook(Prisma.ModelName.Post, PrismaOperation.Update, async (args, request) => {
  if (request) {
    const session = useSession<AuthSession>(request);
    
    if (session?.userId) {
      // Ensure users can only update their own posts
      args.where = {
        ...args.where,
        authorId: session.userId
      };
    }
  }
  
  return args;
});

// Request-aware logging
usePrismaHook(Prisma.ModelName.Order, PrismaOperation.Delete, async (args, request) => {
  if (request) {
    const session = useSession<AuthSession>(request);
    console.log(`User ${session?.userId} deleting order from ${request.ip}`);
  }
  
  return args;
});
```

**Note**: The `request` parameter is optional and will be `undefined` when Prisma operations are executed outside of an HTTP request context (e.g., in background jobs, during initialization).

### Getting Request Context Manually

You can also manually get the current request context anywhere in your code:

```typescript
import { getRequest } from "@tsdiapi/prisma";
import { useSession } from "@tsdiapi/jwt-auth";

interface AuthSession {
  userId: string;
  email: string;
  roles: string[];
}

// Inside any async function during request processing
async function someFunction() {
  const request = getRequest();
  
  if (request) {
    const session = useSession<AuthSession>(request);
    
    console.log('Current user:', session?.userId);
    console.log('User email:', session?.email);
    console.log('Request ID:', request.id);
    console.log('IP Address:', request.ip);
  }
}
```

---

## Configuration Options

| Option             | Type     | Default Value         | Description                                 |
| ------------------ | -------- | --------------------- | ------------------------------------------- |
| `client`           | `any`    | **Required**          | Prisma Client class or instance to use.    |
| `prismaOptions`    | `object` | `{ transactionOptions: { timeout: 10000 } }` | Options for Prisma Client configuration. |

### Example Configuration

```typescript
import prismaPlugin from "@tsdiapi/prisma";
import { PrismaClient } from "@generated/prisma/client.js";

const plugin = prismaPlugin({
  client: PrismaClient,
  prismaOptions: {
    transactionOptions: {
      timeout: 15000, // 15 seconds
      isolationLevel: 'ReadCommitted'
    },
    errorFormat: 'pretty',
    log: ['query', 'info', 'warn', 'error']
  }
});
```

---

## Lifecycle Integration

- **`onInit`**: Initializes the Prisma client and sets up hooks/events.
- **Cleanup**: Ensures the Prisma client disconnects on shutdown (`SIGINT`, `SIGTERM`, `exit`).

---

## Example Use Cases

### Basic Setup

Create a simple setup to modify and log Prisma queries:

```typescript
import { createApp } from "@tsdiapi/server";
import prismaPlugin from "@tsdiapi/prisma";
import { PrismaClient } from "@generated/prisma/client.js";

createApp({
  plugins: [
    prismaPlugin({
      client: PrismaClient,
      prismaOptions: {
        transactionOptions: { timeout: 10000 }
      }
    })
  ],
});
```

Define hooks and listeners to customize database interactions:

```typescript
import { usePrismaHook, onBeforeHook, onAfterHook, PrismaOperation } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";

// Hook to modify data before creation
usePrismaHook(Prisma.ModelName.User, PrismaOperation.Create, (args) => {
  console.log("Creating user:", args.data);
  args.data.createdAt = new Date();
  return args;
});

// Event listener after creation
onAfterHook(Prisma.ModelName.User, PrismaOperation.Create, (payload) => {
  console.log(`User created successfully: ${payload.result.id}`);
});
```

### Advanced: Soft Delete with Global Hooks

Implement soft delete across all models using global hooks:

```typescript
import { usePrismaHookForAll, PrismaOperation } from "@tsdiapi/prisma";

// Models that support soft delete
const softDeleteModels = ['User', 'Post', 'Comment', 'Order'];

// Override delete operations to perform soft delete
usePrismaHookForAll(PrismaOperation.Delete, async (args, model, operation, request) => {
  if (softDeleteModels.includes(model)) {
    // Transform delete into update
    args = {
      ...args,
      data: {
        deletedAt: new Date(),
        deletedBy: request ? useSession(request)?.userId : 'system'
      }
    };
    
    // Change operation to update (handled internally by changing args)
    console.log(`Soft deleting ${model} instead of hard delete`);
  }
  return args;
});

// Filter out soft-deleted records from all find operations
usePrismaHookForAll(PrismaOperation.FindMany, async (args, model, operation) => {
  if (softDeleteModels.includes(model)) {
    args.where = {
      ...args.where,
      deletedAt: null // Only show non-deleted records
    };
  }
  return args;
});

usePrismaHookForAll(PrismaOperation.FindFirst, async (args, model, operation) => {
  if (softDeleteModels.includes(model)) {
    args.where = {
      ...args.where,
      deletedAt: null
    };
  }
  return args;
});
```

### Advanced: Multi-Tenancy with Request Context

Implement automatic tenant isolation using request context:

```typescript
import { usePrismaHook, PrismaOperation } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";
import { useSession } from "@tsdiapi/jwt-auth";

// Define your session type
interface AuthSession {
  userId: string;
  tenantId: string;
  roles: string[];
}

// Automatically filter all queries by tenant
const tenantModels = ['User', 'Post', 'Order'] as const;

tenantModels.forEach(model => {
  // Add tenant filter to all find operations
  usePrismaHook(Prisma.ModelName[model], PrismaOperation.FindMany, async (args, request) => {
    if (request) {
      const session = useSession<AuthSession>(request);
      if (session?.tenantId) {
        args.where = {
          ...args.where,
          tenantId: session.tenantId
        };
      }
    }
    return args;
  });
  
  // Add tenant ID to all create operations
  usePrismaHook(Prisma.ModelName[model], PrismaOperation.Create, async (args, request) => {
    if (request) {
      const session = useSession<AuthSession>(request);
      if (session?.tenantId) {
        args.data.tenantId = session.tenantId;
      }
    }
    return args;
  });
  
  // Ensure updates only affect tenant's data
  usePrismaHook(Prisma.ModelName[model], PrismaOperation.Update, async (args, request) => {
    if (request) {
      const session = useSession<AuthSession>(request);
      if (session?.tenantId) {
        args.where = {
          ...args.where,
          tenantId: session.tenantId
        };
      }
    }
    return args;
  });
});
```

### Audit Logging with Request Context

Track all database changes with user information using global events:

```typescript
import { onAfterHookForAll, PrismaOperation, getRequest, usePrisma } from "@tsdiapi/prisma";
import { PrismaClient } from "@generated/prisma/client.js";
import { useSession } from "@tsdiapi/jwt-auth";

interface AuthSession {
  userId: string;
  email: string;
  roles: string[];
}

// Get Prisma client
const prisma = usePrisma<PrismaClient>();

// Audit log for all mutations using global events
const auditOperations = [
  PrismaOperation.Create,
  PrismaOperation.Update,
  PrismaOperation.Delete
] as const;

auditOperations.forEach(operation => {
  onAfterHookForAll(operation, async (payload) => {
    const request = getRequest();
    const session = request ? useSession<AuthSession>(request) : null;
    
    // Log to audit table
    await prisma.auditLog.create({
      data: {
        model: payload.model,
        operation: payload.operation,
        userId: session?.userId || 'system',
        userEmail: session?.email,
        ipAddress: request?.ip,
        userAgent: request?.headers['user-agent'],
        data: JSON.stringify(payload.args),
        result: payload.result ? JSON.stringify(payload.result) : null,
        timestamp: new Date()
      }
    });
  });
});
```

**Benefits of using global events:**
- Single registration instead of looping through all models
- Automatically covers new models without code changes
- Cleaner and more maintainable code

---

## API Reference

### Exported Functions

#### Events (Read-only, for logging/monitoring)
- **`onBeforeHook(model, operation, handler)`**: Register a listener for events before Prisma operations on specific model.
- **`onAfterHook(model, operation, handler)`**: Register a listener for events after Prisma operations on specific model.
- **`onBeforeHookForAll(operation, handler)`**: Register a global listener for events before operations on all models. Use `'*'` for all operations.
- **`onAfterHookForAll(operation, handler)`**: Register a global listener for events after operations on all models. Use `'*'` for all operations.

#### Hooks (Can modify query arguments)
- **`usePrismaHook(model, operation, handler)`**: Register a hook to modify query arguments before execution. Handler receives `(args, request?)` parameters.
- **`usePrismaHookForAll(operation, handler)`**: Register a global hook for all models. Handler receives `(args, model, operation, request?)`. Use `'*'` for operation to catch all operations.

#### Utilities
- **`usePrisma<T>()`**: Get the current Prisma client instance with type safety.
- **`getRequest()`**: Get the current Fastify request from async context (returns `undefined` if not in request context).

### Exported Types

- **`PrismaOperation`**: Enum containing all supported Prisma operations.
- **`PrismaEventOperation`**: Enum for distinguishing before/after events.
- **`PrismaEventPayload<M, O, Args, Result>`**: Type for event payload data.
- **`GlobalPrismaHookHandler`**: Type for global hook handlers.
- **`GlobalPrismaEventHandler`**: Type for global event handlers.
- **`PluginOptions`**: Configuration options for the plugin.

### Available Operations

The `PrismaOperation` enum includes:
- `FindUnique`, `FindUniqueOrThrow`, `FindFirst`, `FindFirstOrThrow`, `FindMany`
- `Create`, `CreateMany`, `Update`, `UpdateMany`
- `Delete`, `DeleteMany`, `Upsert`
- `Aggregate`, `GroupBy`, `Count`

---

## Summary

The **@tsdiapi/prisma** plugin streamlines Prisma integration by providing hooks, events, and lifecycle management. With this plugin, you can easily customize and extend database operations in a clean and modular way.

For more details, refer to the [documentation](https://github.com/unbywyd/tsdiapi-prisma).
