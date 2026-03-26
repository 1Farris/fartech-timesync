
# Dockerfile
# -----------------------
# Configuration file for building the Docker image for the backend server. 
# Specifies the base image, working directory, and build instructions.

FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]