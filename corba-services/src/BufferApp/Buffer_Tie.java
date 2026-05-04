package BufferApp;


/**
* BufferApp/Buffer_Tie.java .
* Error!  A message was requested which does not exist.  The messages file does not contain the key: toJavaProlog1
* Error!  A message was requested which does not exist.  The messages file does not contain the key: toJavaProlog2
* lunes, 4 de mayo de 2026, 20:33:42 (hora de verano de Europa central)
*/

public class Buffer_Tie extends _BufferImplBase
{

  // Constructors
  public Buffer_Tie ()
  {
  }

  public Buffer_Tie (BufferApp.BufferOperations impl)
  {
    super ();
    _impl = impl;
  }

  public int num_elementos ()
  {
    return _impl.num_elementos();
  } // num_elementos

  public boolean put (String elemento)
  {
    return _impl.put(elemento);
  } // put

  public boolean get (org.omg.CORBA.StringHolder elemento)
  {
    return _impl.get(elemento);
  } // get

  public boolean read (org.omg.CORBA.StringHolder elemento)
  {
    return _impl.read(elemento);
  } // read

  public boolean fijarLimiteNoticias (int numero_maximo)
  {
    return _impl.fijarLimiteNoticias(numero_maximo);
  } // fijarLimiteNoticias

  public void shutdown ()
  {
    _impl.shutdown();
  } // shutdown

  private BufferApp.BufferOperations _impl;

} // class Buffer_Tie
