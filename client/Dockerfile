# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Copy a custom Nginx configuration (optional, for flexibility)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]