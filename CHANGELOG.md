# Changelog

All notable changes to this project will be documented in this file.

## [0.3.5] - 2024-11-16

### Added
- **Request Context in Hooks**: Prisma hooks can now access the current Fastify request context
  - New optional `request` parameter in `usePrismaHook` handlers
  - `getRequest()` function to manually get current request context
  - Uses AsyncLocalStorage for automatic context propagation
  - Full backward compatibility - existing hooks work without changes

- **Global Hooks for All Models**: New `usePrismaHookForAll` function for cross-cutting concerns
  - Apply hooks to all models with a single registration
  - Support for `'*'` operation to catch all operations
  - Handler receives model name for conditional logic
  - Perfect for auditing, multi-tenancy, soft deletes

- **Global Event Listeners**: New `onBeforeHookForAll` and `onAfterHookForAll` functions
  - Listen to events across all models with a single registration
  - Support for `'*'` operation to catch all operations
  - Perfect for logging, monitoring, performance tracking
  - Separate from hooks - events are read-only

### Features
- Multi-tenancy support through request context
- User-based filtering and authorization
- Request-aware audit logging
- Automatic context isolation between concurrent requests
- Global hooks for cross-cutting concerns
- TypeScript support with proper overloads

### Examples Added
- Basic hook usage with request context
- Multi-tenancy implementation
- Audit logging with user tracking
- Authorization patterns

### Internal Changes
- Added `context.ts` module for AsyncLocalStorage management
- Updated hook registry to pass request context
- Added Fastify `onRequest` hook for context setup
- Improved TypeScript types for better IDE support

## [0.3.4] - Previous Version

### Features
- Prisma Client Integration
- Event System
- Hook Support
- Lifecycle Management
- Configurable Options
