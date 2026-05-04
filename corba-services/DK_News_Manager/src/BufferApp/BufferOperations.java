package BufferApp;


/**
* BufferApp/BufferOperations.java .
* Error!  A message was requested which does not exist.  The messages file does not contain the key: toJavaProlog1
* Error!  A message was requested which does not exist.  The messages file does not contain the key: toJavaProlog2
* lunes, 4 de mayo de 2026, 20:46:01 (hora de verano de Europa central)
*/

public interface BufferOperations 
{
  int num_elementos ();
  boolean put (String elemento);
  boolean get (org.omg.CORBA.StringHolder elemento);
  boolean read (org.omg.CORBA.StringHolder elemento);
  boolean fijarLimiteNoticias (int numero_maximo);
  void shutdown ();
} // interface BufferOperations
