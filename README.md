# Atelion — Cardboard.ai Architecture & Application

Cardboard.ai is a next-generation AI video editor designed for high-velocity video production in the browser and natively on Apple Silicon.

## Project Structure

```
Atelion/
├── .gitignore
├── README.md
├── frontend/             # React 18 + Vite + TailwindCSS + Zustand UI
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── LandingPage.tsx
│       │   ├── SubPages.tsx
│       │   ├── DashboardView.tsx
│       │   ├── VideoEditorView.tsx
│       │   ├── ShareModal.tsx
│       │   └── ExportModal.tsx
│       ├── store/
│       ├── types/
│       └── data/
└── backend/              # Node.js + Express REST API Server
    ├── package.json
    ├── .env.example
    └── src/
        └── server.js
```

## Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with:
- The luxury dark-mode landing page matching all Cardboard marketing sections
- Multi-track NLE Video Editor with live canvas rendering, timeline playhead scrubbing, inspector, and AI Director (GPT-6 Astra)
- Interactive Dashboard and Project Manager
- Timestamped Team Comments & 4K Export Modals

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Runs the Express API on `http://localhost:5000` supporting:
- Project state persistence (`/api/projects`)
- AI Director execution engine (`/api/director/chat`)
- Media assets & upload pipeline (`/api/upload`)
- Multi-threaded video export simulation (`/api/export`)
- Real-time timestamped team comments (`/api/comments`)
