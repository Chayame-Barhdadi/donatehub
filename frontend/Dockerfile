# ============================================
# Stage 1: Build the Angular application
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first for dependency caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build -- --configuration=production

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from build stage
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
