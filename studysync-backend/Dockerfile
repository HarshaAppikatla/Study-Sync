# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package jar
COPY src src
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal, secure JRE runtime container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
ENTRYPOINT ["java", "-jar", "app.jar"]
