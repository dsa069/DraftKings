package ual.dss.xmlib;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import ual.dss.core.Noticia;

public class NoticiaValidator {

	private static final Pattern FECHA_PATTERN = Pattern.compile("(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\\d{4}");
	private static final Pattern HASHTAG_PATTERN = Pattern.compile("#\\S+");

	private NoticiaValidator() {
	}

	public static List<String> validate(Noticia noticia) {
		List<String> errores = new ArrayList<String>();
		if (noticia == null) {
			errores.add("La noticia no puede ser nula.");
			return errores;
		}

		if (isBlank(noticia.getFecha()) || !FECHA_PATTERN.matcher(noticia.getFecha().trim()).matches()) {
			errores.add("La fecha debe tener formato dd/mm/aaaa.");
		}

		int jugadorLen = countWithoutSpaces(noticia.getJugador());
		if (jugadorLen < 2 || jugadorLen > 50) {
			errores.add("El nombre del jugador debe tener entre 2 y 50 caracteres.");
		}

		if (noticia.getInteres() == null) {
			errores.add("El interes debe ser: alta, media o baja.");
		}

		int tituloLen = countWithoutSpaces(noticia.getTitulo());
		if (tituloLen < 5 || tituloLen > 30) {
			errores.add("El titulo debe tener entre 5 y 30 caracteres.");
		}

		int descripcionLen = countWithoutSpaces(noticia.getDescripcion());
		if (descripcionLen < 20 || descripcionLen > 250) {
			errores.add("La descripcion debe tener entre 20 y 250 caracteres.");
		}

		List<String> etiquetas = noticia.getEtiquetas();
		if (etiquetas == null || etiquetas.isEmpty()) {
			errores.add("Debe incluir al menos una etiqueta.");
		} else {
			if (etiquetas.size() > 6) {
				errores.add("No se permiten mas de 6 etiquetas.");
			}
			for (String etiqueta : etiquetas) {
				if (isBlank(etiqueta) || !HASHTAG_PATTERN.matcher(etiqueta.trim()).matches()) {
					errores.add("Cada etiqueta debe ser una sola palabra con formato hashtag (#...).");
					break;
				}
			}
		}
		return errores;
	}

	public static List<String> parseEtiquetas(String etiquetasRaw) {
		List<String> etiquetas = new ArrayList<String>();
		if (etiquetasRaw == null) {
			return etiquetas;
		}
		String trimmed = etiquetasRaw.trim();
		if (trimmed.isEmpty()) {
			return etiquetas;
		}

		String[] parts = trimmed.split("\\s+");
		for (String part : parts) {
			if (!part.trim().isEmpty()) {
				etiquetas.add(part.trim());
			}
		}
		return etiquetas;
	}

	private static int countWithoutSpaces(String value) {
		if (value == null) {
			return 0;
		}
		return value.replaceAll("\\s+", "").length();
	}

	private static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}
