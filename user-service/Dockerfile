# Build stage
FROM eclipse-temurin:21-jdk-jammy AS builder

# Install Maven
RUN apt-get update && apt-get install -y maven \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy pom.xml and download dependencies (use Docker cache)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY . .

# Package the Spring Boot application
RUN mvn clean package -DskipTests

# Final stage - use JRE instead of JDK
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Launch the app
CMD ["java", "-jar", "app.jar"]