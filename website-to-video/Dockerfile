FROM node:20-slim

# Chromium + ffmpeg (full build: mp4/webm/gif encoders) + fonts for faithful rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium ffmpeg \
    fonts-liberation fonts-noto-color-emoji fonts-noto-cjk \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV CHROMIUM_PATH=/usr/bin/chromium \
    FFMPEG_PATH=/usr/bin/ffmpeg \
    PUPPETEER_ARGS="--no-sandbox --disable-dev-shm-usage" \
    NODE_ENV=production \
    DATA_DIR=/data

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .

EXPOSE 5361
VOLUME ["/data"]
CMD ["node", "server/index.js"]
