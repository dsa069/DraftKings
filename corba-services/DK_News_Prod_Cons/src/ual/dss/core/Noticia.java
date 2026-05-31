package ual.dss.core;

import java.util.ArrayList;
import java.util.List;

public class Noticia {

	private String fecha;
	private String jugador;
	private Interes interes;
	private String titulo;
	private String descripcion;
	private List<String> etiquetas;

	public Noticia() {
		this.fecha = "";
		this.jugador = "";
		this.interes = null;
		this.titulo = "";
		this.descripcion = "";
		this.etiquetas = new ArrayList<String>();
	}

	public Noticia(String fecha, Interes interes, String titulo, String descripcion, List<String> etiquetas) {
		this(fecha, "", interes, titulo, descripcion, etiquetas);
	}

	public Noticia(String fecha, String jugador, Interes interes, String titulo, String descripcion,
			List<String> etiquetas) {
		this.fecha = fecha;
		this.jugador = jugador;
		this.interes = interes;
		this.titulo = titulo;
		this.descripcion = descripcion;
		this.etiquetas = etiquetas == null ? new ArrayList<String>() : new ArrayList<String>(etiquetas);
	}

	public Noticia(String fecha, String interes, String titulo, String descripcion, List<String> etiquetas) {
		this(fecha, "", Interes.fromValue(interes), titulo, descripcion, etiquetas);
	}

	public Noticia(String fecha, String interes, String jugador, String titulo, String descripcion,
			List<String> etiquetas) {
		this(fecha, jugador, Interes.fromValue(interes), titulo, descripcion, etiquetas);
	}

	public String getFecha() {
		return fecha;
	}

	public void setFecha(String fecha) {
		this.fecha = fecha;
	}

	public String getJugador() {
		return jugador;
	}

	public void setJugador(String jugador) {
		this.jugador = jugador;
	}

	public Interes getInteres() {
		return interes;
	}

	public void setInteres(Interes interes) {
		this.interes = interes;
	}

	public void setInteres(String interes) {
		this.interes = Interes.fromValue(interes);
	}

	public String getInteresValue() {
		return interes == null ? "" : interes.getValue();
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public List<String> getEtiquetas() {
		return new ArrayList<String>(etiquetas);
	}

	public void setEtiquetas(List<String> etiquetas) {
		this.etiquetas = etiquetas == null ? new ArrayList<String>() : new ArrayList<String>(etiquetas);
	}

	@Override
	public String toString() {
		return "Noticia [fecha=" + fecha + ", jugador=" + jugador + ", interes=" + getInteresValue() + ", titulo="
				+ titulo + ", descripcion=" + descripcion
				+ ", etiquetas=" + etiquetas + "]";
	}
}
