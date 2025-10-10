# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/41f8c72a-c188-4eba-9c92-15edd5532794

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/41f8c72a-c188-4eba-9c92-15edd5532794) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local backend (Express + MongoDB)

The repository now includes an API server in the `server` directory. It exposes mocked dashboard data through MongoDB so you can prototype against a local database.

### Prerequisites

- MongoDB running locally (default URI `mongodb://127.0.0.1:27017/ecofinds`).
- Node.js 18+ installed.

### Setup

```sh
# Install backend dependencies
npm install --prefix server

# Copy env vars and adjust when needed
cp server/.env.example server/.env

# (Optional) reseed mock data
npm run seed --prefix server

# Start the API on http://localhost:4000
npm run dev --prefix server
```

The API currently exposes `GET /api/dashboard`, seeded with the same mocked data used in the React UI.

### Frontend configuration

The Vite client reads `VITE_API_BASE_URL` to know where the API is hosted. Create or update `.env` in the project root when you need a custom host:

```sh
echo "VITE_API_BASE_URL=http://localhost:4000" >> .env
```

If the variable is not set, the client falls back to `http://localhost:4000` by default.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/41f8c72a-c188-4eba-9c92-15edd5532794) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
