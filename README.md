# @tsdiapi/prisma: Prisma Integration Plugin for TSDIAPI-Server

**@tsdiapi/prisma** seamlessly integrates **Prisma** with **TSDIAPI-Server**, providing hooks, events, and lifecycle management to enhance database operations.

---

## Features

- **Prisma Client Integration**: Automatically sets up and manages Prisma Client.
- **Event System**: Listen to events before and after Prisma operations.
- **Hook Support**: Dynamically modify queries using hooks.
- **Lifecycle Management**: Handles Prisma Client initialization and cleanup during app lifecycle.
- **Configurable Options**: Define query timeouts and load custom Prisma-related files via glob patterns.

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

Available functions:

- **`onBeforeHook(model, operation, handler)`**: Triggered before a Prisma query.
- **`onAfterHook(model, operation, handler)`**: Triggered after a query is executed.

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

## Example Use Case

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

---

## API Reference

### Exported Functions

- **`onBeforeHook(model, operation, handler)`**: Register a listener for events before Prisma operations.
- **`onAfterHook(model, operation, handler)`**: Register a listener for events after Prisma operations.
- **`usePrismaHook(model, operation, handler)`**: Register a hook to modify query arguments before execution.
- **`usePrisma<T>()`**: Get the current Prisma client instance with type safety.

### Exported Types

- **`PrismaOperation`**: Enum containing all supported Prisma operations.
- **`PrismaEventOperation`**: Enum for distinguishing before/after events.
- **`PrismaEventPayload<M, O, Args, Result>`**: Type for event payload data.
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
