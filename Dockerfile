FROM node:19-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

EXPOSE 4173

CMD [ "npm", "run", "preview" ]