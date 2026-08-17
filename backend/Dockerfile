FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy backend Maven configuration
COPY backend/pom.xml .

# Copy backend source code
COPY backend/src ./src

# Copy frontend because the Maven build uses it
COPY frontend /frontend

# Download Maven dependencies
RUN mvn dependency:go-offline -B

# Build the Spring Boot application
RUN mvn clean package -DskipTests


# =========================
# Runtime stage
# =========================

FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the generated Spring Boot JAR
COPY --from=build /app/target/*.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]