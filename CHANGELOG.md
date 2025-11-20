# Changelog

## [0.5.0] - 2025-11-20

### Breaking Changes
- **Prisma 7.0+ Adapter Support**: The plugin now requires Prisma 7.0+ with adapter configuration
- Client must be instantiated with adapter (e.g., `PrismaPg`) instead of passing class
- Added required peer dependencies: `@prisma/adapter-pg`, `pg`

### Added
- Support for PostgreSQL adapter (`@prisma/adapter-pg`)
- New `prisma/prisma.config.ts` file generation for Prisma CLI configuration
- Shadow database URL support for safe migrations
- Improved configuration split between CLI and runtime
- Updated TypeScript definitions for adapter-based client

### Changed
- `registration` in `tsdiapi.config.json` now generates adapter-based client code
- Updated README with Prisma 7.0+ adapter examples
- Enhanced installation instructions with required dependencies

### Dependencies
- Added `@prisma/adapter-pg` ^7.0.0 (peer dependency)
- Added `pg` ^8.11.0 (peer dependency)
- Added `@types/pg` ^8.10.0 (dev dependency)

## [0.4.0] - Previous Release

- Updated to support `@tsdiapi/server` v0.4.0
- Updated Prisma dependencies to ^7.0.0
- Updated Fastify to ^5.6.2