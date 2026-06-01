#!/bin/bash
# Script para compilar y ejecutar los tests JUnit 4 de DK_News_Prod_Cons

cd "$(dirname "$0")"

# Descargar las librerías necesarias de JUnit 4 si no existen
mkdir -p lib_test
if [ ! -f "lib_test/junit-4.13.2.jar" ]; then
    wget -qO lib_test/junit-4.13.2.jar https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar
fi
if [ ! -f "lib_test/hamcrest-core-1.3.jar" ]; then
    wget -qO lib_test/hamcrest-core-1.3.jar https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar
fi

# Compilar las clases de test
mkdir -p build/classes
javac -cp "build/classes:lib_test/junit-4.13.2.jar:lib/servlet-api.jar" -d build/classes src/test/*.java

# Ejecutar los tests
java -cp "build/classes:lib_test/junit-4.13.2.jar:lib_test/hamcrest-core-1.3.jar:lib/servlet-api.jar" \
    org.junit.runner.JUnitCore \
    test.InteresTest test.NoticiaTest test.NoticiaValidatorTest test.ValidatorTest test.XMLibTest
