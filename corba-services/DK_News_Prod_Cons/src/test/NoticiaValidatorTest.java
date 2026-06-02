package test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;

import java.util.Arrays;
import java.util.List;

import org.junit.Test;

import ual.dss.core.Interes;
import ual.dss.core.Noticia;
import ual.dss.xmlib.NoticiaValidator;

public class NoticiaValidatorTest {

	private Noticia noticiaBase() {
		return new Noticia(
				"20/03/2026",
				"Jugador Base",
				Interes.MEDIA,
				"Nuevo mercado local",
				"Descripcion de prueba con contenido suficiente para cumplir longitudes minimas sin espacios.",
				Arrays.asList("#mercado", "#almeria"));
	}

	@Test
	public void noticiaValida() {
		Noticia noticia = noticiaBase();
		assertTrue(NoticiaValidator.validate(noticia).isEmpty());
	}

	@Test
	public void noticiaInvalidaPorFechaInteresYEtiquetas() {
		Noticia noticia = new Noticia(
				"2026-03-20",
				"Jugador Base",
				"urgente",
				"Titulo corto",
				"Descripcion de prueba con contenido suficiente para cumplir longitudes minimas sin espacios.",
				Arrays.asList("mercado", "#almeria"));
		assertFalse(NoticiaValidator.validate(noticia).isEmpty());
	}

	@Test
	public void noticiaInvalidaPorLongitudes() {
		Noticia noticia = new Noticia(
				"20/03/2026",
				"Jugador Base",
				Interes.BAJA,
				"a b",
				"demasiado corta",
				Arrays.asList("#ok"));
		assertFalse(NoticiaValidator.validate(noticia).isEmpty());
	}

	@Test
	public void noticiaValidaConMuchosEspaciosNoContados() {
		Noticia noticia = new Noticia(
				"20/03/2026",
				"Jugador Con Espacios",
				Interes.ALTA,
				"    Titulo      con       espacios    ",
				"Esta      descripcion   incluye     multiples espacios y debe seguir siendo valida por longitud no blanca.",
				Arrays.asList("#espacios", "#prueba"));
		assertTrue(NoticiaValidator.validate(noticia).isEmpty());
	}

	@Test
	public void noticiaInvalidaPorJugadorCorto() {
		Noticia noticia = new Noticia(
				"20/03/2026",
				"A",
				Interes.ALTA,
				"Titulo valido",
				"Descripcion valida con contenido suficiente para cumplir longitudes minimas sin espacios.",
				Arrays.asList("#uno"));
		List<String> errores = NoticiaValidator.validate(noticia);
		assertFalse(errores.isEmpty());
		assertTrue(errores.toString().contains("jugador"));
	}

	@Test
	public void noticiaNulaDevuelveError() {
		List<String> errores = NoticiaValidator.validate(null);
		assertEquals(1, errores.size());
		assertTrue(errores.get(0).contains("nula"));
	}

	@Test
	public void noticiaInvalidaPorInteresNulo() {
		Noticia noticia = noticiaBase();
		noticia.setInteres((Interes) null);
		List<String> errores = NoticiaValidator.validate(noticia);
		assertFalse(errores.isEmpty());
		assertTrue(errores.get(0).contains("interes") || errores.toString().contains("interes"));
	}

	@Test
	public void noticiaInvalidaPorExcesoDeEtiquetas() {
		Noticia noticia = noticiaBase();
		noticia.setEtiquetas(Arrays.asList("#a", "#b", "#c", "#d", "#e", "#f", "#g"));
		List<String> errores = NoticiaValidator.validate(noticia);
		assertFalse(errores.isEmpty());
		assertTrue(errores.toString().contains("6"));
	}

	@Test
	public void noticiaInvalidaPorEtiquetaSinHashtag() {
		Noticia noticia = noticiaBase();
		noticia.setEtiquetas(Arrays.asList("sinHashtag", "#ok"));
		List<String> errores = NoticiaValidator.validate(noticia);
		assertFalse(errores.isEmpty());
		assertTrue(errores.toString().contains("hashtag"));
	}

	@Test
	public void parseEtiquetasGestionaNullYEspacios() {
		assertTrue(NoticiaValidator.parseEtiquetas(null).isEmpty());
		assertTrue(NoticiaValidator.parseEtiquetas("   ").isEmpty());
		List<String> etiquetas = NoticiaValidator.parseEtiquetas("  #uno   #dos   #tres ");
		assertEquals(3, etiquetas.size());
		assertEquals("#uno", etiquetas.get(0));
		assertEquals("#dos", etiquetas.get(1));
		assertEquals("#tres", etiquetas.get(2));
	}
}
