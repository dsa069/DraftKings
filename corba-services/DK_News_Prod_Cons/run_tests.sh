#!/bin/bash
# Script para compilar y ejecutar los tests JUnit 4 de DK_News_Prod_Cons con reportes

cd "$(dirname "$0")"

# 1. Crear directorios necesarios
mkdir -p lib_test lib target/surefire-reports build/classes build/test-classes

# 2. Descargar Servlet API para producción (si no existe)
if [ ! -f "lib/servlet-api.jar" ]; then
    echo "Descargando Servlet API..."
    wget -qO lib/servlet-api.jar https://repo1.maven.org/maven2/javax/servlet/javax.servlet-api/4.0.1/javax.servlet-api-4.0.1.jar
fi

# 3. Descargar herramientas de testing (JUnit y JaCoCo)
if [ ! -f "lib_test/junit-4.13.2.jar" ]; then
    wget -qO lib_test/junit-4.13.2.jar https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar
fi
if [ ! -f "lib_test/hamcrest-core-1.3.jar" ]; then
    wget -qO lib_test/hamcrest-core-1.3.jar https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar
fi
if [ ! -f "lib_test/junit-ant-4.13.2.jar" ]; then
    wget -qO lib_test/junit-ant-4.13.2.jar https://repo1.maven.org/maven2/org/apache/ant/ant-junit/1.10.12/ant-junit-1.10.12.jar
fi
if [ ! -f "lib_test/jacoco-agent.jar" ] || [ ! -f "lib_test/jacoco-cli.jar" ]; then
    echo "Descargando JaCoCo..."
    wget -qO lib_test/jacoco-agent.jar https://repo1.maven.org/maven2/org/jacoco/org.jacoco.agent/0.8.8/org.jacoco.agent-0.8.8-runtime.jar
    # AQUI ESTA EL CAMBIO: Se usa -nodeps.jar en lugar de -all.jar
    wget -qO lib_test/jacoco-cli.jar https://repo1.maven.org/maven2/org/jacoco/org.jacoco.cli/0.8.8/org.jacoco.cli-0.8.8-nodeps.jar
fi

# 4. Compilar el código de producción de la aplicación
echo "=== Compilando código de producción ==="
find src -name "*.java" ! -path "*src/test*" > sources.txt
if [ -s sources.txt ]; then
    javac -d build/classes -cp "lib/servlet-api.jar" @sources.txt
fi
rm -f sources.txt

# 5. Compilar las clases de test
echo "=== Compilando clases de test ==="
javac -cp "build/classes:lib_test/junit-4.13.2.jar:lib/servlet-api.jar" -d build/test-classes src/test/*.java

# 6. Ejecutar los tests con JaCoCo agent para cobertura
echo "=== Ejecutando tests con JUnit y JaCoCo ==="
mkdir -p target/coverage
java -javaagent:lib_test/jacoco-agent.jar=destfile=target/coverage/jacoco.exec \
    -cp "build/classes:build/test-classes:lib_test/junit-4.13.2.jar:lib_test/hamcrest-core-1.3.jar:lib/servlet-api.jar" \
    org.junit.runner.JUnitCore \
    test.InteresTest test.NoticiaTest test.NoticiaValidatorTest test.ValidatorTest test.XMLibTest

# 7. Generar reporte de cobertura JaCoCo
echo "=== Generando reporte de cobertura JaCoCo ==="
mkdir -p target/site/jacoco
java -jar lib_test/jacoco-cli.jar report target/coverage/jacoco.exec \
    --classfiles build/classes \
    --sourcefiles src \
    --xml target/site/jacoco/jacoco.xml \
    --html target/site/jacoco

echo "=== ¡Proceso Finalizado! ==="