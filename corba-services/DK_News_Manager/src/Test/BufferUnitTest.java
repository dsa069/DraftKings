package Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
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
		private int limite = 30;
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
		public synchronized String[] obtener_todas() {
			String[] resultado = new String[datos.size()];
			for (int i = 0; i < datos.size(); i++) {
				resultado[i] = i + "|" + datos.get(i);
			}
			return resultado;
		}

		@Override
		public synchronized boolean read_en(int indice, StringHolder elemento) {
			if (indice < 0 || indice >= datos.size()) {
				elemento.value = "";
				return false;
			}
			elemento.value = datos.get(indice);
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
		for (int i = 1; i <= 30; i++) {
			assertTrue(buffer.put(noticia("n" + i, "#" + i)));
		}
		assertFalse(buffer.put(noticia("n31", "#31")));
		assertEquals(30, buffer.num_elementos());
	}

	@Test
	public void obtenerTodasYReadEn() {
		buffer.put(noticia("n1", "#uno"));
		buffer.put(noticia("n2", "#dos"));
		buffer.put(noticia("n3", "#tres"));

		assertArrayEquals(new String[] {
				"0|" + noticia("n1", "#uno"),
				"1|" + noticia("n2", "#dos"),
				"2|" + noticia("n3", "#tres")
		}, buffer.obtener_todas());

		assertTrue(buffer.read_en(1, holder));
		assertTrue(holder.value.contains("<titulo>n2</titulo>"));
		assertTrue(buffer.read_en(0, holder));
		assertTrue(holder.value.contains("<titulo>n1</titulo>"));
		assertFalse(buffer.read_en(3, holder));
		assertEquals("", holder.value);
	}

	@Test
	public void shutdown() {
		buffer.shutdown();
		assertTrue(buffer.isApagado());
	}
}
