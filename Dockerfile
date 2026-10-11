FROM oven/bun:alpine

WORKDIR /app

# Install dependencies first so this layer is cached across source changes.
COPY package.json ./
RUN bun install --production

COPY index.js config.js ./

EXPOSE 3000

# The base image ships a non-root "bun" user.
USER bun

CMD ["bun", "index.js"]
