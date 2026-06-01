package test;

import static org.junit.Assert.*;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

import org.junit.Before;
import org.junit.Test;

import ual.dss.xmlib.Validator;

public class ValidatorTest {

	private String xsd;
	private String xmlOk;
	private String xmlRoto;

	@Before
	public void setUp() throws Exception {
		this.xsd = "noticias.xsd";
		this.xmlOk = "noticias_ej.xml";
		this.xmlRoto = "noticias_ejRoto.xml";
	}

	@Test
	public void test() {
		assertTrue(Validator.validate(xmlOk, xsd));
	}

	@Test
	public void testRoto() {
		assertTrue(!Validator.validate(xmlRoto, xsd));
	}

	@Test
	public void testValidateXMLContentConRutaXsd() {
		String xml = "<gestorNoticias>"
				+ "<noticia>"
				+ "<fecha>20/03/2026</fecha>"
				+ "<jugador>Nombre del Jugador</jugador>"
				+ "<interes>media</interes>"
				+ "<titulo>Titulo valido</titulo>"
				+ "<descripcion>Descripcion valida con contenido suficiente para validar por XSD correctamente.</descripcion>"
				+ "<etiquetas><etiqueta>#ok</etiqueta></etiquetas>"
				+ "</noticia>"
				+ "</gestorNoticias>";
		assertTrue(Validator.validateXMLContent(xml, xsd));
	}

	@Test
	public void testValidateXMLContentConInputStream() throws Exception {
		String xml = "<gestorNoticias>"
				+ "<noticia>"
				+ "<fecha>20/03/2026</fecha>"
				+ "<jugador>Otro Jugador Valido</jugador>"
				+ "<interes>baja</interes>"
				+ "<titulo>Otro titulo</titulo>"
				+ "<descripcion>Descripcion valida con contenido suficiente para validar por XSD mediante stream.</descripcion>"
				+ "<etiquetas><etiqueta>#ok</etiqueta></etiquetas>"
				+ "</noticia>"
				+ "</gestorNoticias>";
		FileInputStream xsdStream = new FileInputStream(xsd);
		assertTrue(Validator.validateXMLContent(xml, xsdStream));
	}

	@Test
	public void testValidateXMLContentInputStreamNulo() {
		String xml = "<gestorNoticias></gestorNoticias>";
		assertFalse(Validator.validateXMLContent(xml, (java.io.InputStream) null));
	}

	@Test
	public void testValidateXMLContentConXsdInvalido() {
		String xml = "<gestorNoticias></gestorNoticias>";
		ByteArrayInputStream xsdInvalido = new ByteArrayInputStream("<xsd>".getBytes(StandardCharsets.UTF_8));
		assertFalse(Validator.validateXMLContent(xml, xsdInvalido));
	}

}
