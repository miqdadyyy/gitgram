FROM node:12-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --production
RUN npm cache clean --force
ENV NODE_ENV="production"
ENV APP_ID 12345
ENV PRIVATE_KEY privatekey
ENV TELEGRAM_BOT_TOKEN bot_token
ENV FIRESTORE_KEY_PATH path_to_firestore

COPY . .
CMD [ "npm", "start" ]
