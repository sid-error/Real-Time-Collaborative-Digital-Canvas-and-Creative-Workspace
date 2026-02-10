FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pkgconfig \
    pixman-dev \
  && npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
