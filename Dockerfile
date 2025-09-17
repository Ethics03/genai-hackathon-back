FROM node:24-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy only dependency files first (better cache usage)
COPY package.json pnpm-lock.yaml* ./

# dependencies install 
RUN pnpm install --frozen-lockfile

#copying rest of the directories and files
COPY . .

RUN pnpm run build

EXPOSE 5173

CMD ["pnpm","start:dev"]

