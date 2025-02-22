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

createApp({
  plugins: [
    prismaPlugin({
      prismaOptions: {
        transactionOptions: { timeout: 15000 },
      },
    }),
  ],
});
```

### Access Prisma Client

The Prisma client is available via the `client` export:

```typescript
import { client } from "@tsdiapi/prisma";

const users = await client.user.findMany();
console.log(users);
```

---

## Event Handling

### Define Prisma Event Listeners

Use decorators to respond to specific database events:

```typescript
import { DbAfterListener, PrismaOperation } from "@tsdiapi/prisma";
import { Service } from "typedi";

@Service()
export class CustomEvents {
  @DbAfterListener("User", PrismaOperation.Create)
  public afterUserCreate(result: { args: any; result: any }) {
    console.log(`User created with ID: ${result.result.id}`);
  }
}
```

Available decorators:

- **`DbBeforeListener(model, operation)`**: Triggered before a Prisma query.
- **`DbAfterListener(model, operation)`**: Triggered after a query is executed.

---

## Hook System

Modify queries dynamically using hooks:

```typescript
import { Operation, PrismaOperation } from "@tsdiapi/prisma";
import { Service } from "typedi";

@Service()
export class QueryHooks {
  @Operation(PrismaOperation.Create, "User")
  public modifyUserCreate(args: { data: any }) {
    args.data.name = `Modified-${args.data.name}`;
    return args; // Return the modified query arguments
  }
}
```

---

## Configuration Options

| Option             | Type     | Default Value         | Description                                 |
| ------------------ | -------- | --------------------- | ------------------------------------------- |
| `prismaOptions`    | `object` | `{}`                  | Options for Prisma Client (e.g., timeouts). |
| `autoloadGlobPath` | `string` | `"*.prisma{.ts,.js}"` | Glob pattern for custom Prisma files.       |

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

createApp({
  plugins: [prismaPlugin()],
});
```

Define hooks and listeners to customize database interactions:

```typescript
@Service()
export class UserEvents {
  @Operation(PrismaOperation.Create, "User")
  public logUserCreation(args: { data: any }) {
    console.log("Creating user:", args.data);
  }

  @DbAfterListener("User", PrismaOperation.Create)
  public afterUserCreated(result: { result: any }) {
    console.log(`User created successfully: ${result.result.id}`);
  }
}
```

---

## Summary

The **@tsdiapi/prisma** plugin streamlines Prisma integration by providing hooks, events, and lifecycle management. With this plugin, you can easily customize and extend database operations in a clean and modular way.

For more details, refer to the [documentation](https://github.com/unbywyd/tsdiapi-prisma).
