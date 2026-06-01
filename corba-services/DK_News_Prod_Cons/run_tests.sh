#!/bin/bash
# Script para compilar y ejecutar los tests JUnit 4 de DK_News_Prod_Cons con reportes

cd "$(dirname "$0")"

# Descargar las librerías necesarias de JUnit 4 y herramientas de testing
mkdir -p lib_test target/surefire-reports
if [ ! -f "lib_test/junit-4.13.2.jar" ]; then
    wget -qO lib_test/junit-4.13.2.jar https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar
fi
if [ ! -f "lib_test/hamcrest-core-1.3.jar" ]; then
    wget -qO lib_test/hamcrest-core-1.3.jar https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar
fi
if [ ! -f "lib_test/junit-ant-4.13.2.jar" ]; then
    wget -qO lib_test/junit-ant-4.13.2.jar https://repo1.maven.org/maven2/org/apache/ant/ant-junit/1.10.12/ant-junit-1.10.12.jar
fi
if [ ! -f "lib_test/jacoco-0.8.8.jar" ]; then
    wget -qO lib_test/jacoco-agent.jar https://repo1.maven.org/maven2/org/jacoco/org.jacoco.agent/0.8.8/org.jacoco.agent-0.8.8-runtime.jar
    wget -qO lib_test/jacoco-cli.jar https://repo1.maven.org/maven2/org/jacoco/org.jacoco.cli/0.8.8/org.jacoco.cli-0.8.8-all.jar
fi

# Compilar las clases de test
mkdir -p build/classes
javac -cp "build/classes:lib_test/junit-4.13.2.jar:lib/servlet-api.jar" -d build/classes src/test/*.java

# Ejecutar los tests con JaCoCo agent para cobertura
mkdir -p target/coverage
java -javaagent:lib_test/jacoco-agent.jar=destfile=target/coverage/jacoco.exec \
    -cp "build/classes:lib_test/junit-4.13.2.jar:lib_test/hamcrest-core-1.3.jar:lib/servlet-api.jar" \
    org.junit.runner.JUnitCore \
    test.InteresTest test.NoticiaTest test.NoticiaValidatorTest test.ValidatorTest test.XMLibTest

# Generar reporte de cobertura JaCoCo
mkdir -p target/site/jacoco
java -jar lib_test/jacoco-cli.jar report target/coverage/jacoco.exec \
    --classfiles build/classes \
    --sourcefiles src \
    --xml target/site/jacoco/jacoco.xml \
    --html target/site/jacoco 2>/dev/null || true
