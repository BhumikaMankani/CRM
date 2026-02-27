# Build stage
FROM node:20-slim AS build

WORKDIR /app/frontend
COPY my-react-app/package*.json ./
RUN npm install
COPY my-react-app/ ./
RUN npm run build

# Final stage
FROM node:20-slim

WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY server/ ./server/
COPY --from=build /app/frontend/dist ./my-react-app/dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
