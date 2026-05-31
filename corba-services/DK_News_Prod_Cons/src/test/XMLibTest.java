package test;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import ual.dss.core.Interes;
import ual.dss.core.Noticia;
import ual.dss.xmlib.XMLCoder;
import ual.dss.xmlib.XMLDecoder;

public class XMLibTest {

	List<Noticia> noticias;
	String resultado;
	@Before
	public void setUp() throws Exception {
		Noticia noticia = new Noticia(
				"25/12/2025",
				Interes.ALTA,
				"Festival de musica local",
				"Descripcion extensa para pruebas unitarias del codificador y decodificador XML en el flujo productor consumidor.",
				Arrays.asList("#musica", "#festivalAlmeria"));
		noticias = new ArrayList<Noticia>();
		noticias.add(noticia);
		resultado = XMLCoder.codeXML(noticias);
	}

	@Test
	public void testCoder() {
		try {
			String xml = XMLCoder.codeXML(noticias);
			assertTrue(xml.contains("<gestorNoticias>"));
			assertTrue(xml.contains("<noticia>"));
			assertTrue(xml.contains("<fecha>25/12/2025</fecha>"));
			assertTrue(xml.contains("<interes>alta</interes>"));
			assertTrue(xml.contains("<titulo>Festival de musica local</titulo>"));
			assertTrue(xml.contains("<etiqueta>#musica</etiqueta>"));
		} catch (Exception e) {
			e.printStackTrace();
			fail("No debe lanzar excepcion al codificar XML de noticias.");
		}
	}

	@Test
	public void testDecoder() {
		try {
			Noticia noticiaDecodificada = XMLDecoder.decodeXML(resultado, 0).get(0);
			assertEquals(noticias.get(0).getFecha(), noticiaDecodificada.getFecha());
			assertEquals(noticias.get(0).getInteres(), noticiaDecodificada.getInteres());
			assertEquals(noticias.get(0).getTitulo(), noticiaDecodificada.getTitulo());
			assertEquals(noticias.get(0).getDescripcion(), noticiaDecodificada.getDescripcion());
			assertEquals(noticias.get(0).getEtiquetas(), noticiaDecodificada.getEtiquetas());
		} catch (Exception e) {
			e.printStackTrace();
			fail("No debe lanzar excepcion al decodificar XML de noticias.");
		}
	}

	@Test
	public void testCoderConListaVacia() {
		try {
			String xml = XMLCoder.codeXML(new ArrayList<Noticia>());
			assertEquals("ERROR empty List", xml);
		} catch (Exception e) {
			fail("No debe lanzar excepcion con lista vacia.");
		}
	}

	@Test
	public void testDecoderConXmlMalFormado() {
		List<Noticia> salida = XMLDecoder.decodeXML("<gestorNoticias><noticia>", 0);
		assertTrue(salida.isEmpty());
	}

	@Test
	public void testDecoderConInteresInvalido() {
		String xml = "<gestorNoticias>"
				+ "<noticia>"
				+ "<fecha>20/03/2026</fecha>"
				+ "<interes>urgente</interes>"
				+ "<titulo>Titulo valido</titulo>"
				+ "<descripcion>Descripcion valida con contenido suficiente para el decodificador XML.</descripcion>"
				+ "<etiquetas><etiqueta>#uno</etiqueta></etiquetas>"
				+ "</noticia>"
				+ "</gestorNoticias>";
		List<Noticia> salida = XMLDecoder.decodeXML(xml, 1);
		assertTrue(salida.isEmpty());
	}

	@Test
	public void testDecoderConElementoObligatorioAusente() {
		String xml = "<gestorNoticias>"
				+ "<noticia>"
				+ "<interes>alta</interes>"
				+ "<titulo>Titulo valido</titulo>"
				+ "<descripcion>Descripcion valida con contenido suficiente para el decodificador XML.</descripcion>"
				+ "<etiquetas><etiqueta>#uno</etiqueta></etiquetas>"
				+ "</noticia>"
				+ "</gestorNoticias>";
		List<Noticia> salida = XMLDecoder.decodeXML(xml, 1);
		assertTrue(salida.isEmpty());
	}

}
