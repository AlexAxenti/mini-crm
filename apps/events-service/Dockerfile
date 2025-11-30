FROM node:20-alpine

# Root working directory for the repo inside the container
WORKDIR /app

# Copy the entire monorepo into the container
COPY . .

# 1) Build the shared package
WORKDIR /app/packages/shared
RUN npm install
RUN npm run build

# 2) Build the events-service
WORKDIR /app/apps/events-service
RUN npm install
RUN npm run prisma:generate
RUN npm run build

# Expose the Nest events-service port
EXPOSE 3001

# Run the production build
CMD ["npm", "run", "start:prod"]
