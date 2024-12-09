# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Install necessary system dependencies for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install Puppeteer
RUN npm install puppeteer-core@23.10.1 chrome-aws-lambda

# Set up the working directory
WORKDIR /usr/src/app

# Copy your app files into the container
COPY . .

# Install dependencies
RUN npm install

# Expose the port that your app will run on
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ]
