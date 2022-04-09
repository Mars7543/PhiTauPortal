FROM node:17.8.0
WORKDIR /app

COPY package*.json .
RUN npm install -g nodemon && npm install

COPY . /app

EXPOSE 3000

CMD [ "npm", "run", "dev" ]