FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

EXPOSE 3000

RUN npm run build

ENTRYPOINT ["npm", "start"]