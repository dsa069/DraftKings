package ual.dss.xmlib;

import javax.xml.XMLConstants;
import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.*;
import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;
import java.util.List;
import java.io.*;
import java.util.LinkedList;
public class Validator {

	/**
	 * Valida el xml.
	 *
	 * @param xml the xml
	 * @param xsd the xsd
	 * @return true, if successful
	 */
	public static boolean validate(String xml, String xsd) {

		try {
			// XML a validar
			Source xmlFile = new StreamSource(new File(xml));
			return validateSource(xmlFile, xsd);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	public static boolean validateXMLContent(String xmlContent, String xsd) {
		try {
			Source xmlSource = new StreamSource(new StringReader(xmlContent));
			Source schemaSource = new StreamSource(new File(xsd));
			return validateSource(xmlSource, schemaSource);
		} catch (SAXException e) {
			e.printStackTrace();
			return false;
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
	}

	public static boolean validateXMLContent(String xmlContent, InputStream xsdInputStream) {
		if (xsdInputStream == null) {
			return false;
		}
		try {
			Source xmlSource = new StreamSource(new StringReader(xmlContent));
			Source schemaSource = new StreamSource(xsdInputStream);
			return validateSource(xmlSource, schemaSource);
		} catch (SAXException e) {
			e.printStackTrace();
			return false;
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private static boolean validateSource(Source xmlSource, String xsd) throws SAXException, IOException {
		Source schemaFile = new StreamSource(new File(xsd));
		return validateSource(xmlSource, schemaFile);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private static boolean validateSource(Source xmlSource, Source schemaFile) throws SAXException, IOException {
		SchemaFactory schemaFactory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
		Schema schema = schemaFactory.newSchema(schemaFile);
		javax.xml.validation.Validator validator = schema.newValidator();
		final List exceptions = new LinkedList();
		validator.setErrorHandler(new ErrorHandler() {
			public void warning(SAXParseException exception) throws SAXException {
				exceptions.add(exception);
			}

			public void fatalError(SAXParseException exception) throws SAXException {
				exceptions.add(exception);
			}

			public void error(SAXParseException exception) throws SAXException {
				exceptions.add(exception);
			}
		});

		validator.validate(xmlSource);
		return exceptions.size() == 0;
	}
}
