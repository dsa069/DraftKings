package ual.dss.xmlib;

import java.util.List;

import ual.dss.core.Noticia;

public class XMLCoder {

	private XMLCoder() {
		// Utility class
	}

	public static String codeXML(List<Noticia> noticias) {
		if (noticias == null || noticias.isEmpty()) {
			return "ERROR empty List";
		}

		StringBuilder salida = new StringBuilder();
		salida.append("<gestorNoticias>");

		for (Noticia noticia : noticias) {
			if (noticia == null) {
				continue;
			}

			salida.append("<noticia>");
			salida.append("<fecha>").append(escapeXml(noticia.getFecha())).append("</fecha>");
			salida.append("<jugador>").append(escapeXml(noticia.getJugador())).append("</jugador>");
			salida.append("<interes>").append(escapeXml(noticia.getInteresValue())).append("</interes>");
			salida.append("<titulo>").append(escapeXml(noticia.getTitulo())).append("</titulo>");
			salida.append("<descripcion>").append(escapeXml(noticia.getDescripcion())).append("</descripcion>");
			salida.append("<etiquetas>");
			for (String etiqueta : noticia.getEtiquetas()) {
				salida.append("<etiqueta>").append(escapeXml(etiqueta)).append("</etiqueta>");
			}
			salida.append("</etiquetas>");
			salida.append("</noticia>");
		}

		salida.append("</gestorNoticias>");
		return salida.toString();
	}

	private static String escapeXml(String value) {
		if (value == null) {
			return "";
		}
		return value
				.replace("&", "&amp;")
				.replace("<", "&lt;")
				.replace(">", "&gt;")
				.replace("\"", "&quot;")
				.replace("'", "&apos;");
	}
}
