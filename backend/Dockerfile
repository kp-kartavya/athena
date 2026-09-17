FROM eclipse-temurin:17-jre

WORKDIR /app

RUN useradd --system --uid 10001 --create-home athena

RUN mkdir -p /app/data

COPY target/interview-preparation-bot-*.jar app.jar

RUN chown -R athena:athena /app

USER athena

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]