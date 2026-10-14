# ========================================================
# SpendWise Full Stack Expense Tracker - Multi-stage Dockerfile
# ========================================================

# Stage 1: Build Application with Maven
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and static frontend resources
COPY backend/src ./src

# Package JAR (skipping unit tests during container assembly)
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Secure JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create unprivileged system user for security
RUN addgroup -S spendwise && adduser -S spendwise -G spendwise

# Copy executable jar from builder stage
COPY --from=builder /app/target/expense-tracker-backend-1.0.0.jar app.jar

# Set ownership
RUN chown -R spendwise:spendwise /app
USER spendwise

# Configure environment defaults
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
