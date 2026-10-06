# Multi-stage Dockerfile for PAARI Net Food Redistribution Platform
# Stage 1: Build Frontend (Node 20 Debian slim)
FROM node:20-bullseye-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --no-audit

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend (Maven 3.9 + Temurin JDK 17)
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /app

COPY pom.xml ./
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src

# Inject built frontend assets into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist/ ./backend/src/main/resources/static/

WORKDIR /app/backend
RUN mvn clean package -DskipTests -Dfrontend.skip=true

# Stage 3: Lightweight Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# Persistent directory for local H2 file database
RUN mkdir -p /app/data

# Copy packaged JAR from backend-builder
COPY --from=backend-builder /app/backend/target/*.jar /app/app.jar

ENV PORT=10000
ENV SPRING_PROFILES_ACTIVE=dev

EXPOSE 10000

# Run with 384MB heap limit to ensure stability on Render 512MB free tier
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar --server.port=${PORT}"]
