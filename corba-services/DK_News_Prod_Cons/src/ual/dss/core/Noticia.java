package ual.dss.core;

import java.util.ArrayList;
import java.util.List;

public class Noticia {

	private String fecha;
	private Interes interes;
	private String titulo;
	private String descripcion;
	private List<String> etiquetas;

	public Noticia() {
		this.fecha = "";
		this.interes = null;
		this.titulo = "";
		this.descripcion = "";
		this.etiquetas = new ArrayList<String>();
	}

	public Noticia(String fecha, Interes interes, String titulo, String descripcion, List<String> etiquetas) {
		this.fecha = fecha;
		this.interes = interes;
		this.titulo = titulo;
		this.descripcion = descripcion;
		this.etiquetas = etiquetas == null ? new ArrayList<String>() : new ArrayList<String>(etiquetas);
	}

	public Noticia(String fecha, String interes, String titulo, String descripcion, List<String> etiquetas) {
		this(fecha, Interes.fromValue(interes), titulo, descripcion, etiquetas);
	}

	public String getFecha() {
		return fecha;
	}

	public void setFecha(String fecha) {
		this.fecha = fecha;
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
		return "Noticia [fecha=" + fecha + ", interes=" + getInteresValue() + ", titulo=" + titulo + ", descripcion=" + descripcion
				+ ", etiquetas=" + etiquetas + "]";
	}
}
