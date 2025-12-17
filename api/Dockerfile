FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json .

# Expose port
EXPOSE 3000

# Start dev server
CMD ["pnpm", "dev"]