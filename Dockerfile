FROM node:22

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY patches/sig.js node_modules/@distube/ytdl-core/lib/sig.js

CMD ["node", "index.js"]