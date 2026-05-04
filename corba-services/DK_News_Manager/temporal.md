"/c/Program Files (x86)/Java/jdk-1.8/bin/orbd" -ORBInitialPort 1050 -ORBInitialHost localhost


/opt/java/openjdk/bin/orbd -ORBInitialPort 1050 -ORBInitialHost localhost


cd /workspaces/DraftKings/corba-services/DK_News_Manager
mvn clean package
java -jar target/corba-buffer-server-1.0.0-jar-with-dependencies.jar -ORBInitialPort 1050 -ORBInitialHost localhost