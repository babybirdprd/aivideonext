# Source Code Structure

## Overview
The project follows a modular architecture with clear separation of concerns, built on Next.js 14 with TypeScript. The source code is organized into distinct sections for frontend components, API routes, services, and state management.

## App Directory (src/app/)
Next.js 14 app router structure with:

### Pages
- `page.tsx`: Main editor interface using EditorLayout
- `layout.tsx`: Root layout with providers
- `globals.css`: Global styles
- `favicon.ico`: Site favicon

### API Routes (/api)
1. AI Endpoints
   - `/ai/route.ts`: Main AI processing
   - `/ai/autonomous/route.ts`: Autonomous video generation
   - `/ai/replicate/route.ts`: Replicate API integration

2. Authentication
   - `/auth/[...nextauth]/`: NextAuth.js implementation
   - `/auth/signin/page.tsx`: Sign-in interface

3. Collaboration
   - `/collaboration/[projectId]/route.ts`: Real-time collaboration

4. Rendering
   - `/render/route.ts`: Video rendering endpoints
   - `/render/[projectId]/route.ts`: Project-specific rendering

5. Templates
   - `/templates/marketplace/route.ts`: Template marketplace
   - `/templates/marketplace/[templateId]/`: Template operations
     - `inherit/route.ts`: Template inheritance
     - `trend/route.ts`: Trend scoring
     - `version/route.ts`: Version management
     - `versions/route.ts`: Version history

### Assets
- `/fonts/`: Custom fonts (GeistVF, GeistMonoVF)

## Components Directory (src/components/)

### Editor Components
1. Core Editor
   - `EditorLayout.tsx`: Main editor interface with drag-and-drop (react-dnd)
   - `VideoFormatSelector.tsx`: Format selection interface
   - `StyleTransferTest.tsx`: Style transfer testing

2. Block System
   - `blocks/BlockContent.tsx`: Block content renderer
   - `blocks/DraggableBlock.tsx`: Draggable block implementation
   - `blocks/EffectBlockEditor.tsx`: Effect block editing
   - `blocks/TransitionBlockEditor.tsx`: Transition editing

3. Timeline & Preview
   - `timeline/DroppableTimeline.tsx`: Timeline with drop zones
   - `preview/PreviewPanel.tsx`: Video preview component
   - `preview/PreviewRenderer.tsx`: WebGL rendering
   - `preview/shaders.ts`: GLSL shaders

4. Properties & AI
   - `properties/PropertyPanel.tsx`: Property editing
   - `autonomous/AutonomousPanel.tsx`: AI tools interface

5. Collaboration
   - `collaboration/CollaborationOverlay.tsx`: Real-time collaboration UI

### Media Components
- `media/MediaDialog.tsx`: Media selection dialog
- `media/MediaSelector.tsx`: Media browsing interface

### Template Components
- `templates/TemplateForm.tsx`: Template creation/editing
- `templates/TemplateGrid.tsx`: Template gallery
- `templates/TemplatePreview.tsx`: Template preview
- `templates/MarketplaceTemplateCard.tsx`: Template card
- `templates/TrendingTemplates.tsx`: Trending section
- `templates/TemplateVersionDialog.tsx`: Version management

### UI Components
Comprehensive UI kit based on DaisyUI:
- Buttons, Cards, Dialogs
- Form elements (Input, Select, Checkbox)
- Navigation (Tabs, Dropdown)
- Feedback (Toast, Alert)
- Layout (Toggle, Switch)

## Services Directory (src/services/)

### AI Services
1. Autonomous Video Creation
   - `autonomous.service.ts`: Main autonomous service
     * Video concept generation
     * Asset generation/sourcing
     * Composition creation
     * Edit planning and execution

2. Enhancement Services
   - `enhancement.service.ts`: Video enhancement
   - `style.service.ts`: Style transfer
   - `trend.service.ts`: Trend analysis

3. External AI Integration
   - `openai.service.ts`: OpenAI API integration
   - `replicate.service.ts`: Replicate API integration

### Media Services
1. Processing
   - `ffmpeg.service.ts`: Video processing with FFmpeg
   - `render.service.ts`: Rendering pipeline
   - `websocket.service.ts`: Progress tracking

2. Asset Management
   - `pexels.service.ts`: Stock media integration

### Template Services
- `marketplace.service.ts`: Template marketplace
  * Template CRUD operations
  * Version management
  * Inheritance system
  * Trend scoring
  * Asset integration

### Collaboration Services
- `collaboration.service.ts`: Real-time collaboration
  * User synchronization
  * Event handling
  * State management

## State Management (src/store/)
- `editor.store.ts`: Editor state and actions
- `template.store.ts`: Template management
- `collaboration.store.ts`: Collaboration state
- Typed interfaces in respective .types.ts files

## Utilities
### Hooks
- `useRenderProgress.ts`: Render progress tracking
- `use-toast.ts`: Toast notifications

### Library
- `prisma.ts`: Database client
- `utils.ts`: Shared utilities

## Type Definitions (src/types/)
- `video-format.types.ts`: Video format definitions
- `video.types.ts`: Video-related types
