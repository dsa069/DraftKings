package ual.dss.xmlib;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXParseException;

import ual.dss.core.Interes;
import ual.dss.core.Noticia;
public class XMLDecoder {

	private static final String NOTICIA_TAG = "noticia";
	
	/**
	 * Decodifica el XML a partir de un string.
	 *
	 * @param xml El xml a decodificar
	 * @param flag the flag
	 * @return La lista de noticias decodificadas
	 */
	public static List<Noticia> decodeXML(String xml, int flag){
		try {
	          
	          DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
	          InputSource is = new InputSource();
	          is.setCharacterStream(new StringReader(xml));

	          Document doc = db.parse(is);

	          
	          doc.getDocumentElement().normalize();
	          NodeList nList = doc.getElementsByTagName(NOTICIA_TAG);
	          List<Noticia> salida = new ArrayList<Noticia>();
	         for (int temp = 0; temp < nList.getLength(); temp++) {
	            Node nNode = nList.item(temp);
	            if (nNode.getNodeType() == Node.ELEMENT_NODE) {
	                    Element eElement = (Element) nNode;
	                    salida.add(parseNoticia(eElement));
	             }
	         }
	         return salida;
	       } catch (SAXParseException e) {
	    	   System.out.println("\nERROR!!!!: Tag mal formado");
	    	   		
	       }  catch (Exception e) {
	    	   System.out.println("\nERROR!!!!: "+e.getMessage());
	       }
		return new ArrayList<Noticia>();   
	}

	private static Noticia parseNoticia(Element eElement) throws Exception {
		if (eElement.getElementsByTagName("fecha").getLength() == 0) {
			throw new Exception("Falta el elemento fecha");
		}
		if (eElement.getElementsByTagName("interes").getLength() == 0) {
			throw new Exception("Falta el elemento interes");
		}
		if (eElement.getElementsByTagName("titulo").getLength() == 0) {
			throw new Exception("Falta el elemento titulo");
		}
		if (eElement.getElementsByTagName("descripcion").getLength() == 0) {
			throw new Exception("Falta el elemento descripcion");
		}
		if (eElement.getElementsByTagName("etiquetas").getLength() == 0) {
			throw new Exception("Falta el elemento etiquetas");
		}

		String fecha = eElement.getElementsByTagName("fecha").item(0).getTextContent();
		String interesTexto = eElement.getElementsByTagName("interes").item(0).getTextContent();
		String titulo = eElement.getElementsByTagName("titulo").item(0).getTextContent();
		String descripcion = eElement.getElementsByTagName("descripcion").item(0).getTextContent();
		Interes interes = Interes.fromValue(interesTexto);
		if (interes == null) {
			throw new Exception("Valor de interes invalido: " + interesTexto);
		}

		List<String> etiquetas = new ArrayList<String>();
		Element etiquetasElement = (Element) eElement.getElementsByTagName("etiquetas").item(0);
		NodeList etiquetaNodes = etiquetasElement.getElementsByTagName("etiqueta");
		for (int i = 0; i < etiquetaNodes.getLength(); i++) {
			Node etiquetaNode = etiquetaNodes.item(i);
			if (etiquetaNode.getNodeType() == Node.ELEMENT_NODE) {
				etiquetas.add(etiquetaNode.getTextContent());
			}
		}

		return new Noticia(fecha, interes, titulo, descripcion, etiquetas);
	}
	
}
