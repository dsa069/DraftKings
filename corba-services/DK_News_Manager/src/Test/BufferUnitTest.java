package Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.omg.CORBA.StringHolder;

import BufferApp.BufferOperations;

public class BufferUnitTest {

	private static class FakeBuffer implements BufferOperations {
		private final List<String> datos = new ArrayList<String>();
		private int limite = 2;
		private boolean apagado;

		@Override
		public synchronized int num_elementos() {
			return datos.size();
		}

		@Override
		public synchronized boolean put(String elemento) {
			if (elemento == null || elemento.trim().isEmpty() || datos.size() >= limite) {
				return false;
			}
			datos.add(elemento);
			return true;
		}

		@Override
		public synchronized boolean get(StringHolder elemento) {
			if (datos.isEmpty()) {
				elemento.value = "";
				return false;
			}
			elemento.value = datos.remove(0);
			return true;
		}

		@Override
		public synchronized boolean read(StringHolder elemento) {
			if (datos.isEmpty()) {
				elemento.value = "";
				return false;
			}
			elemento.value = datos.get(0);
			return true;
		}

		@Override
		public synchronized boolean fijarLimiteNoticias(int numero_maximo) {
			if (numero_maximo <= 0) {
				return false;
			}
			limite = numero_maximo;
			while (datos.size() > limite) {
				datos.remove(datos.size() - 1);
			}
			return true;
		}

		@Override
		public void shutdown() {
			apagado = true;
		}

		public boolean isApagado() {
			return apagado;
		}
	}

	private FakeBuffer buffer;
	private StringHolder holder;

	@BeforeEach
	public void setUp() {
		buffer = new FakeBuffer();
		holder = new StringHolder();
	}

	private String noticia(String titulo, String etiqueta) {
		return "<noticia><titulo>" + titulo + "</titulo><etiqueta>" + etiqueta + "</etiqueta></noticia>";
	}

	@Test
	public void putYLimite() {
		assertTrue(buffer.put(noticia("n1", "#uno")));
		assertTrue(buffer.put(noticia("n2", "#dos")));
		assertFalse(buffer.put(noticia("n3", "#tres")));
		assertEquals(2, buffer.num_elementos());
	}

	@Test
	public void readNoDestructivoYGetFIFO() {
		buffer.put(noticia("n1", "#uno"));
		buffer.put(noticia("n2", "#dos"));

		assertTrue(buffer.read(holder));
		assertTrue(holder.value.contains("<titulo>n1</titulo>"));
		assertEquals(2, buffer.num_elementos());

		assertTrue(buffer.get(holder));
		assertTrue(holder.value.contains("<titulo>n1</titulo>"));
		assertTrue(buffer.get(holder));
		assertTrue(holder.value.contains("<titulo>n2</titulo>"));
	}

	@Test
	public void operacionesEnVacio() {
		assertFalse(buffer.read(holder));
		assertFalse(buffer.get(holder));
		assertEquals("", holder.value);
	}

	@Test
	public void fijarLimiteRecortaYShutdown() {
		buffer.put(noticia("a", "#a"));
		buffer.put(noticia("b", "#b"));
		assertTrue(buffer.fijarLimiteNoticias(1));
		assertEquals(1, buffer.num_elementos());
		assertTrue(buffer.read(holder));
		assertTrue(holder.value.contains("<titulo>a</titulo>"));
		buffer.shutdown();
		assertTrue(buffer.isApagado());
	}
}
