FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY chatplatform/pom.xml .
COPY chatplatform/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/chatplatform-0.0.1-SNAPSHOT.war app.war
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.war"]
