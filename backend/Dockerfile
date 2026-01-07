FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven executable and project files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "target/coffeehub-backend-1.0.0.jar"]