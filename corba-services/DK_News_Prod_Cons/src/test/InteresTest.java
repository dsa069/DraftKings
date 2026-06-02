package test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.junit.Test;

import ual.dss.core.Interes;

public class InteresTest {

	@Test
	public void fromValueAceptaValidosConFormatoFlexible() {
		assertEquals(Interes.ALTA, Interes.fromValue("alta"));
		assertEquals(Interes.MEDIA, Interes.fromValue(" MEDIA "));
		assertEquals(Interes.BAJA, Interes.fromValue("BaJa"));
	}

	@Test
	public void fromValueDevuelveNullParaValoresNoValidos() {
		assertNull(Interes.fromValue(null));
		assertNull(Interes.fromValue(""));
		assertNull(Interes.fromValue("urgente"));
	}

	@Test
	public void getValueYToStringSonConsistentes() {
		assertEquals("alta", Interes.ALTA.getValue());
		assertEquals("media", Interes.MEDIA.toString());
		assertEquals("baja", Interes.BAJA.getValue());
	}
}
