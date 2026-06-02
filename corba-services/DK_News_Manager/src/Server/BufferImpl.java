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
	private static final int MAX_ELEMENTOS = 30;

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
		if (buf.size() >= MAX_ELEMENTOS) {
			System.out.println("BUFFER LLENO");
			return false;
		}
		buf.add(elemento);
		System.out.println("Insertada noticia. Elementos: " + buf.size());
		return true;
	}

	public synchronized String[] obtener_todas() {
		String[] resultado = new String[buf.size()];
		for (int i = 0; i < buf.size(); i++) {
			resultado[i] = i + "|" + buf.get(i);
		}
		return resultado;
	}

	public synchronized boolean read_en(int indice, StringHolder elemento) {
		if (indice < 0 || indice >= buf.size()) {
			elemento.value = "";
			return false;
		}
		elemento.value = buf.get(indice);
		return true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see BufferApp.BufferOperations#num_elementos()
	 */
	public synchronized int num_elementos() {
		return buf.size();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see BufferApp.BufferOperations#shutdown()
	 */
	// implementa el metodo shutdown()
	public void shutdown() {
		if (orb != null) {
			orb.shutdown(false);
		}
	}
}
