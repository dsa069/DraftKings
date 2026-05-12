FROM eclipse-temurin:17-jre

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Set the Spring profile (dev, prod, or default)
ENV SPRING_PROFILES_ACTIVE=dev

# The application's jar file
ARG JAR_FILE=target/*.jar

# Copy the application's jar to the container
COPY ${JAR_FILE} app.jar

# Run the jar file
ENTRYPOINT ["java","-jar","/app.jar"]