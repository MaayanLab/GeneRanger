FROM node:16
RUN apt-get update || : && apt-get install python -y
RUN apt-get install python3-pip -y


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --legacy-peer-deps
COPY requirements.txt /app/requirements.txt
RUN python3 -m pip install -r /app/requirements.txt

# Bundle app source
COPY . .

EXPOSE 3000

RUN npx prisma generate

RUN set -x && chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]