# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json files and install dependencies
COPY package.json ./
RUN npm install

COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY my-react-app/package.json ./my-react-app/
WORKDIR /app/my-react-app
RUN npm install

# Copy the source code
WORKDIR /app
COPY . .

# Build the React app
WORKDIR /app/my-react-app
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Start the server
WORKDIR /app/server
CMD ["npm", "start"]