# Tech Context

## Core Technologies
- Next.js 14 with TypeScript for scalable web development
- Tailwind CSS and DaisyUI for responsive, modern UI design
- Prisma with SQLite for database management
- FFmpeg/WASM for video processing and rendering
- Zod for robust schema validation
- Zustand for state management

## Database Schema (Prisma)
Key models include:
- User: Authentication and profile management
- Project: Video project data with blocks and assets
- Template: Marketplace templates with versioning support
- Asset: Media resources linked to projects
- Account/Session: Authentication-related models

Database features:
- SQLite as the database provider
- JSON string storage for complex data (blocks, settings, metadata)
- Relationship management (User->Projects, Projects->Assets)
- Indexing on frequently queried fields
- Version control system for templates

## External Services
- Integration of advanced AI services (OpenAI for text/image generation, voice synthesis)
- Authentication system using NextAuth
- Media processing pipeline using FFmpeg
