# ============================================
# Node.js/Express Backend Dockerfile
# ============================================
# Stage 1: Build/Production
FROM node:20-alpine

# Install build tools and shared libraries for better-sqlite3 and Prisma
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    openssl \
    libnsl \
    && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production && \
    npm cache clean --force

# Copy application source
COPY . .

# Generate Prisma Client (if using Prisma)
RUN DATABASE_URL="mysql://root:password@localhost:3306/db" npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

# Set environment to production
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["node", "index.js"]
