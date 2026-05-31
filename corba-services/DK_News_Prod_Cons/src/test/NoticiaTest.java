package test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Test;

import ual.dss.core.Interes;
import ual.dss.core.Noticia;

public class NoticiaTest {

	@Test
	public void constructorVacioInicializaValoresPorDefecto() {
		Noticia noticia = new Noticia();

		assertEquals("", noticia.getFecha());
		assertNull(noticia.getInteres());
		assertEquals("", noticia.getInteresValue());
		assertEquals("", noticia.getTitulo());
		assertEquals("", noticia.getDescripcion());
		assertTrue(noticia.getEtiquetas().isEmpty());
	}

	@Test
	public void constructorConInteresEnumAsignaTodosLosCamposYCopiaEtiquetas() {
		List<String> etiquetas = new ArrayList<String>(Arrays.asList("#uno", "#dos"));
		Noticia noticia = new Noticia("21/03/2026", Interes.ALTA, "Titulo", "Descripcion amplia", etiquetas);

		etiquetas.add("#tres");

		assertEquals("21/03/2026", noticia.getFecha());
		assertEquals(Interes.ALTA, noticia.getInteres());
		assertEquals("alta", noticia.getInteresValue());
		assertEquals("Titulo", noticia.getTitulo());
		assertEquals("Descripcion amplia", noticia.getDescripcion());
		assertEquals(Arrays.asList("#uno", "#dos"), noticia.getEtiquetas());
	}

	@Test
	public void constructorConInteresTextoConvierteInteresCorrectamente() {
		Noticia noticia = new Noticia("21/03/2026", " media ", "Titulo", "Descripcion", Arrays.asList("#tag"));

		assertEquals(Interes.MEDIA, noticia.getInteres());
		assertEquals("media", noticia.getInteresValue());
	}

	@Test
	public void settersYGettersDeCamposSimplesFuncionan() {
		Noticia noticia = new Noticia();

		noticia.setFecha("22/03/2026");
		noticia.setTitulo("Nuevo titulo");
		noticia.setDescripcion("Nueva descripcion");

		assertEquals("22/03/2026", noticia.getFecha());
		assertEquals("Nuevo titulo", noticia.getTitulo());
		assertEquals("Nueva descripcion", noticia.getDescripcion());
	}

	@Test
	public void setterInteresPorEnumActualizaInteresYValor() {
		Noticia noticia = new Noticia();

		noticia.setInteres(Interes.BAJA);

		assertEquals(Interes.BAJA, noticia.getInteres());
		assertEquals("baja", noticia.getInteresValue());
	}

	@Test
	public void setterInteresPorTextoActualizaInteresYPermiteInvalidosComoNull() {
		Noticia noticia = new Noticia();

		noticia.setInteres("ALTA");
		assertEquals(Interes.ALTA, noticia.getInteres());
		assertEquals("alta", noticia.getInteresValue());

		noticia.setInteres("invalido");
		assertNull(noticia.getInteres());
		assertEquals("", noticia.getInteresValue());
	}

	@Test
	public void getterYSetterEtiquetasAplicanCopiaDefensivaYNull() {
		Noticia noticia = new Noticia();
		List<String> etiquetasEntrada = new ArrayList<String>(Arrays.asList("#a", "#b"));

		noticia.setEtiquetas(etiquetasEntrada);
		etiquetasEntrada.add("#c");

		assertEquals(Arrays.asList("#a", "#b"), noticia.getEtiquetas());

		List<String> etiquetasLeidas = noticia.getEtiquetas();
		etiquetasLeidas.add("#externa");
		assertEquals(Arrays.asList("#a", "#b"), noticia.getEtiquetas());

		noticia.setEtiquetas(null);
		assertTrue(noticia.getEtiquetas().isEmpty());
	}

	@Test
	public void toStringIncluyeValoresPrincipales() {
		Noticia noticia = new Noticia("23/03/2026", Interes.MEDIA, "Titulo", "Descripcion", Arrays.asList("#x"));
		String texto = noticia.toString();

		assertTrue(texto.contains("fecha=23/03/2026"));
		assertTrue(texto.contains("interes=media"));
		assertTrue(texto.contains("titulo=Titulo"));
		assertTrue(texto.contains("descripcion=Descripcion"));
		assertTrue(texto.contains("#x"));
	}
}
