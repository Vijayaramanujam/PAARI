# Multi-stage Dockerfile for PAARI Net Food Redistribution Platform
# Stage 1: Build Frontend and Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Install Node.js, npm, and build utilities
RUN apk add --no-cache nodejs npm

# Copy Project Descriptors
COPY pom.xml ./
COPY backend/pom.xml ./backend/
COPY frontend/package*.json ./frontend/

# Build Frontend
WORKDIR /app/frontend
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Build Backend with Static Assets Included
WORKDIR /app
COPY backend/src ./backend/src
RUN mkdir -p /app/backend/src/main/resources/static
COPY --from=builder /app/frontend/dist/ /app/backend/src/main/resources/static/

WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Production Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create directory for persistent local H2 file database
RUN mkdir -p /app/data

# Copy built JAR from builder
COPY --from=builder /app/backend/target/*.jar /app/app.jar

# Render dynamic port assignment
ENV PORT=10000
ENV SPRING_PROFILES_ACTIVE=dev

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar --server.port=${PORT}"]
