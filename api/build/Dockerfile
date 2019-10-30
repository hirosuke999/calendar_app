FROM node:8-alpine

WORKDIR /app

# Install firebase CLI tools
RUN npm install -g firebase-tools

# Settings for runtime emulator
ENV HOST 0.0.0.0
EXPOSE 5000

# Settings for firebase login
EXPOSE 9005
