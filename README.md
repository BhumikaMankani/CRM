# CRM Project

This is a full-stack CRM application with a React frontend and Node.js/Express backend.

## Deployment on Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`

2. Login: `fly auth login`

3. Launch the app: `fly launch`

   - Choose a name for your app.

   - Select the region.

   - When prompted, choose "No" for adding a database (or yes if you want Fly's Postgres, but this app uses MongoDB).

4. For MongoDB, you need to set up a MongoDB instance. You can use MongoDB Atlas or Fly's add-ons if available.

5. Set environment variables:

   - `fly secrets set MONGO_URI="your_mongodb_connection_string"`

6. Deploy: `fly deploy`

## Local Development

See the root package.json for scripts.

- `npm run install:all` to install dependencies.

- `npm run dev` to run both frontend and backend in development mode.