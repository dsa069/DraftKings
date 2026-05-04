package Server;

import java.util.ArrayList;
import java.util.List;

import org.omg.CORBA.ORB;
import org.omg.CORBA.StringHolder;

import BufferApp._BufferImplBase;

// TODO: Auto-generated Javadoc
/**
 * The Class BufferImpl.
 */
class BufferImpl extends _BufferImplBase {
	
	/** The orb. */
	private ORB orb;
	
	/** Lista FIFO de noticias serializadas. */
	private final List<String> buf;

	/** The max elementos. */
	private int maxElementos = 5;

	/**
	 * Instantiates a new buffer impl.
	 */
	// implementa el metodo constructor
	BufferImpl() {
		buf = new ArrayList<String>();
	}

	public void setORB(ORB orbVal) {
		orb = orbVal;
	}

	// implementa el metodo put()
	public synchronized boolean put(String elemento) {
		if (elemento == null || elemento.trim().isEmpty()) {
			return false;
		}
		if (buf.size() >= maxElementos) {
			System.out.println("BUFFER LLENO");
			return false;
		}
		buf.add(elemento);
		System.out.println("Insertada noticia. Elementos: " + buf.size());
		return true;
	}

	// implementa el metodo get()
	public synchronized boolean get(StringHolder elemento) {
		if (buf.isEmpty()) {
			elemento.value = "";
			return false;
		}
		elemento.value = buf.remove(0);
		return true;
	}

	// implementa el metodo read()
	public synchronized boolean read(StringHolder elemento) {
		if (buf.isEmpty()) {
			elemento.value = "";
			return false;
		}
		elemento.value = buf.get(0);
		return true;
	}

	/* (non-Javadoc)
	 * @see BufferApp.BufferOperations#num_elementos()
	 */
	public synchronized int num_elementos() {
		return buf.size();
	}

	public synchronized boolean fijarLimiteNoticias(int numero_maximo) {
		if (numero_maximo <= 0) {
			return false;
		}
		maxElementos = numero_maximo;
		while (buf.size() > maxElementos) {
			buf.remove(buf.size() - 1);
		}
		return true;
	}

	/* (non-Javadoc)
	 * @see BufferApp.BufferOperations#shutdown()
	 */
	// implementa el metodo shutdown()
	public void shutdown() {
		if (orb != null) {
			orb.shutdown(false);
		}
	}
}
