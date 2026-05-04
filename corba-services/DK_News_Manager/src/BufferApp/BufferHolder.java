package BufferApp;

/**
* BufferApp/BufferHolder.java .
* Error!  A message was requested which does not exist.  The messages file does not contain the key: toJavaProlog1
* Error!  A message was requested which does not exist.  The messages file does not contain the key: toJavaProlog2
* lunes, 4 de mayo de 2026, 20:46:01 (hora de verano de Europa central)
*/

public final class BufferHolder implements org.omg.CORBA.portable.Streamable
{
  public BufferApp.Buffer value = null;

  public BufferHolder ()
  {
  }

  public BufferHolder (BufferApp.Buffer initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = BufferApp.BufferHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    BufferApp.BufferHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return BufferApp.BufferHelper.type ();
  }

}
