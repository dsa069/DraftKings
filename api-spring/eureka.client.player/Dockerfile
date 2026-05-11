FROM eclipse-temurin:17-jre
# Make port 8080 available to the world outside this container
EXPOSE 8080
# The application's jar file
ARG JAR_FILE=/app/target/*.jar
# Copy the application's jar to the container
COPY --from=build  ${JAR_FILE}  app.jar
# Run the jar file
ENTRYPOINT ["java","-jar","/app.jar"]