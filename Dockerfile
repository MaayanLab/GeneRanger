FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

EXPOSE 3000

RUN npx prisma generate

# RUN npm run build
RUN set -x && chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

# ENTRYPOINT ["npm", "start"]