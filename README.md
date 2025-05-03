# Nature Motivator

A productivity and motivation web app featuring a Pomodoro timer, task management, and a powerful markdown scratchpad. Built with React, Express, and Supabase.

## Features
- **Supabase Integration**: Modern cloud database and authentication.
- **Markdown Scratchpad**: Rich markdown editing with live preview, powered by @uiw/react-md-editor.
- **Pomodoro Timer**: Stay focused with a built-in timer.
- **Task Management**: Organize your tasks and track progress.
- **Responsive UI**: Beautiful, glassmorphic design with dark mode support.

## Tech Stack
- **Frontend**: React, Vite, Zustand, Tailwind CSS, @uiw/react-md-editor
- **Backend**: Express, TypeScript
- **Database**: Supabase (Postgres)
- **Other**: Zod, Lucide Icons, Drizzle ORM

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd nature-motivator
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root with your Supabase credentials:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the development servers
- **Start the backend (API server):**
  ```sh
  npm run dev
  ```
- **Start the frontend (client):**
  In a new terminal:
  ```sh
  npm run dev:client
  ```
- The client will be available at [http://localhost:5173](http://localhost:5173)
- The server runs on [http://localhost:3000](http://localhost:3000)

## Scripts
- `npm run dev` — Start the Express API server (with tsx)
- `npm run dev:client` — Start the Vite React client
- `npm run build` — Build the client and server
- `npm run start` — Start the production server

## Development
- Feature branches are used for new features (e.g. `feature/markdown-editor-change`).
- Pull requests and code reviews are recommended.

## License
MIT 