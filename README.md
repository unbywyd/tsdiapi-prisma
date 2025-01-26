# TSDIAPI-Prisma

**TSDIAPI-Prisma** is a plugin for the TSDIAPI-Server framework, designed to integrate [Prisma](https://www.prisma.io/) into your project. It provides hooks and events for Prisma operations, allowing developers to extend, customize, and observe database interactions with ease.

---

## Features

- **Prisma Client Integration**: Automatically initializes the Prisma client and makes it available throughout the application.
- **Events for Prisma Operations**: Emit and listen to events before and after database queries.
- **Hook System**: Modify query arguments dynamically with hooks.
- **Lifecycle Management**: Handles Prisma client lifecycle with automatic cleanup on application shutdown.
- **Customizable Configuration**: Configure Prisma options and specify glob patterns for loading custom Prisma-related files.

---

## Installation

```bash
npm install tsdiapi-prisma
```

---

## Getting Started

### Register the Plugin

Add the plugin to the `createApp` function of your TSDIAPI-Server application:

```typescript
import { createApp } from "tsdiapi-server";
import prismaPlugin from "tsdiapi-prisma";

createApp({
    plugins: [
        prismaPlugin({
            prismaOptions: {
                transactionOptions: {
                    timeout: 10000,
                },
            }
        }),
    ],
});
```

---

### Define Events for Prisma Operations

You can use the provided event system to listen to Prisma operations. For example:

```typescript
import { DbAfterListener, PrismaOperation } from "tsdiapi-prisma";
// types ...
@Service()
export class CustomEvents {

    @DbAfterListener(Prisma.ModelName['Country'], PrismaOperation.Create)
    public afterCreateCountry(
        result: PrismaEventPayload<"Country", PrismaOperation.Create>
    ) {
        const name = result.args.data.name;
        console.log(`Country created with name: ${name}`);
    }
}
```

- **`DbBeforeListener`**: Listens for events before the Prisma query is executed.
- **`DbAfterListener`**: Listens for events after the Prisma query is executed.

---

### Use Hooks to Modify Queries

Prisma hooks allow you to dynamically modify query arguments before they are sent to the database:

```typescript
import { Operation, PrismaOperation } from "tsdiapi-prisma";
import { Service } from "typedi";
import { Prisma } from "@prisma/client";

// Types to help with Prisma operations
export type PrismaModelNames = keyof typeof Prisma.ModelName;
export type PrismaOperationArgs<
    Model extends PrismaModelNames,
    Operation extends PrismaOperation
> = Prisma.TypeMap["model"][Model]["operations"][Operation]["args"];

export type PrismaOperationResults<
    Model extends PrismaModelNames,
    Operation extends PrismaOperation
> = Prisma.TypeMap["model"][Model]["operations"][Operation]["result"];

export type PrismaEventPayload<
    M extends PrismaModelNames,
    O extends PrismaOperation
> = {
    operation: PrismaOperation;
    args: PrismaOperationArgs<M, O>;
    query: any;
    model: Prisma.ModelName;
    result?: PrismaOperationResults<M, O>;
}


@Service()
export class ModifyHooks {
    @Operation(PrismaOperation.Create, Prisma.ModelName['Country'])
    public updateDates(
        args: PrismaOperationArgs<"Country", PrismaOperation.Create>
    ) {
        const randomName = Math.random().toString(36).substring(7);
        args.data.name = randomName;
        return args; // Return the modified args
    }
}
```

- **`PrismaHooks`**: Marks the class as a hook container.
- **`Operation`**: Marks a method as a handler for a specific Prisma operation and model.

---

## Configuration Options

### PluginOptions

| Option              | Type                | Default Value                 | Description                                |
|---------------------|---------------------|--------------------------------|--------------------------------------------|
| `prismaOptions`     | `object`           | `{ transactionOptions: { timeout: 10000 } }` | Configuration options for Prisma Client.  |
| `globPrismaPath`    | `string`           | `"*.prisma{.ts,.js}"`         | Glob pattern for loading Prisma-related files. |

---

## Lifecycle Integration

TSDIAPI-Prisma hooks into the lifecycle of the application:
- **`onInit`**: Initializes the Prisma client and configures hooks and event listeners.
- **Automatic Cleanup**: Ensures the Prisma client is disconnected when the application shuts down (on `SIGINT`, `SIGTERM`, or `exit`).

---

## Prisma Client Access

The Prisma client instance is available globally via the exported `client`:

```typescript
import { client } from "tsdiapi-prisma";

const users = await client.user.findMany();
console.log(users);
```

---

## Summary

**TSDIAPI-Prisma** simplifies Prisma integration by providing hooks, events, and lifecycle management. Its extensibility makes it easy to customize and monitor database interactions while maintaining clean and modular code.

For more details, refer to the [documentation](https://github.com/unbywyd/tsdiapi-prisma).