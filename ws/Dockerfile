# Production
FROM node:20-alpine AS production
COPY ws/files /var/www/ws
CMD node /var/www/ws/thewebiverse.node.js

# Development
FROM node:20-alpine AS development
CMD node /var/www/ws/thewebiverse.node.js
