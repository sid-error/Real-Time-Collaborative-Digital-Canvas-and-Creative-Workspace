FROM node:18-alpine

WORKDIR /app

# Install system dependencies FIRST — required by the `canvas` npm package
# which needs native compilation tools (python, make, g++) and graphics
# libraries (cairo, pango, jpeg, etc.) to build from source on Alpine.
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
    pixman-dev

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
