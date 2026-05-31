package ual.dss.servlet;

import java.io.IOException;
import java.io.File;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.omg.CORBA.ORB;
import org.omg.CORBA.StringHolder;
import org.omg.CORBA.BAD_OPERATION;
import org.omg.CORBA.MARSHAL;
import org.omg.CosNaming.NamingContextExt;
import org.omg.CosNaming.NamingContextExtHelper;
import org.omg.CosNaming.NamingContextPackage.NotFound;

import BufferApp.Buffer;
import BufferApp.BufferHelper;
import ual.dss.core.Interes;
import ual.dss.core.Noticia;
import ual.dss.xmlib.NoticiaValidator;
import ual.dss.xmlib.Validator;
import ual.dss.xmlib.XMLCoder;
import ual.dss.xmlib.XMLDecoder;

public class ServletImpl extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String DEFAULT_ORB_HOST = "localhost";
	private static final String DEFAULT_ORB_PORT = "1050";
	private static final String DEFAULT_BUFFER_NAME = "Buffer";
	private static final String XSD_NOTICIAS = "noticias.xsd";
	private static final int MAX_NOTICIAS = 30;

	static Buffer bufferImpl;

	protected void actionEnviar(PrintWriter out, Noticia noticia) throws IOException {
		try {
			getreference();
			List<String> errores = NoticiaValidator.validate(noticia);
			if (!errores.isEmpty()) {
				printResultado(out, "<font color='#DF0101'>" + joinErrors(errores));
				return;
			}

			List<Noticia> noticias = new ArrayList<Noticia>();
			noticias.add(noticia);
			String noticiaXML = XMLCoder.codeXML(noticias);
			if (!validateAgainstConfiguredXsd(noticiaXML)) {
				printResultado(out,
						"<font color='#DF0101'>La noticia no cumple el esquema XML de noticias.</font>");
				return;
			}

			if (!bufferImpl.put(noticiaXML)) {
				throw new Exception("No se ha podido insertar la noticia en el buffer.");
			}

			printResultado(out, "<font color='#2EFE64'>Noticia insertada correctamente.</font>");
		} catch (Exception e) {
			printResultado(out, "<font color='#DF0101'>" + getErrorMessage(e) + "</font>");
		}
	}

	protected void actionLeer(PrintWriter out) {
		actionObtenerNoticia(out, false);
	}

	protected void actionRecibir(PrintWriter out) {
		actionObtenerNoticia(out, true);
	}

	protected void actionObtenerTodas(PrintWriter out) {
		try {
			getreference();
			String[] noticias = bufferImpl.obtener_todas();
			if (noticias == null || noticias.length == 0) {
				printResultado(out, "<font color='#DF0101'>El buffer esta vacio.</font>");
				return;
			}

			StringBuilder html = new StringBuilder();
			html.append("<font color='#2EFE64'>Noticias en el buffer: ").append(noticias.length).append("</font>");
			html.append("<ol class='news-list'>");
			for (String noticiaConIndice : noticias) {
				int separador = noticiaConIndice.indexOf('|');
				String indiceTexto = separador >= 0 ? noticiaConIndice.substring(0, separador) : "?";
				String noticiaXML = separador >= 0 ? noticiaConIndice.substring(separador + 1) : noticiaConIndice;
				List<Noticia> noticiasLeidas = XMLDecoder.decodeXML(noticiaXML, 1);
				if (noticiasLeidas.isEmpty()) {
					html.append("<li>[").append(indiceTexto).append("] No se ha podido decodificar una noticia.</li>");
					continue;
				}
				html.append("<li>[").append(indiceTexto).append("] ")
						.append(formatNoticia(noticiasLeidas.get(0))).append("</li>");
			}
			html.append("</ol>");
			printResultado(out, html.toString());
		} catch (Exception e) {
			printResultado(out, "<font color='#DF0101'>" + getErrorMessage(e) + "</font>");
		}
	}

	protected void actionLeerEn(PrintWriter out, int indice) {
		try {
			getreference();
			StringHolder aux = new StringHolder();
			if (!bufferImpl.read_en(indice, aux)) {
				printResultado(out,
						"<font color='#DF0101'>Indice invalido o buffer vacio.</font>");
				return;
			}

			List<Noticia> noticiasLeidas = XMLDecoder.decodeXML(aux.value, 1);
			if (noticiasLeidas.isEmpty()) {
				throw new IllegalStateException("No se ha podido decodificar la noticia seleccionada.");
			}

			printResultado(out, "<font color='#2EFE64'>Noticia en el indice " + indice + ": "
					+ formatNoticia(noticiasLeidas.get(0)) + "</font>");
		} catch (Exception e) {
			printResultado(out, "<font color='#DF0101'>" + getErrorMessage(e) + "</font>");
		}
	}

	private void actionObtenerNoticia(PrintWriter out, boolean consumir) {
		try {
			getreference();
			StringHolder aux = new StringHolder();
			boolean estado = consumir ? bufferImpl.get(aux) : bufferImpl.read(aux);
			if (!estado) {
				printResultado(out,
						"<font color='#DF0101'>" + safeValue(aux.value, "El buffer esta vacio.") + "</font>");
				return;
			}

			List<Noticia> noticiasLeidas = XMLDecoder.decodeXML(aux.value, 1);
			if (noticiasLeidas.isEmpty()) {
				throw new IllegalStateException("No se ha podido decodificar la noticia recibida del buffer.");
			}

			Noticia noticia = noticiasLeidas.get(0);
			String accion = consumir ? "extraida" : "leida";
			printResultado(out, "<font color='#2EFE64'>Noticia " + accion + ": " + formatNoticia(noticia) + "</font>");
		} catch (Exception e) {
			printResultado(out, "<font color='#DF0101'>" + getErrorMessage(e) + "</font>");
		}
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		printResultado(out, "<font color='#DF0101'>Error: los parametros deben enviarse por POST.</font>");
	}

	public void doPost(HttpServletRequest req, HttpServletResponse response) throws IOException, ServletException {
		String action = req.getParameter("action");
		String fecha = req.getParameter("fecha");
		String jugador = req.getParameter("jugador");
		String interes = req.getParameter("interes");
		String titulo = req.getParameter("titulo");
		String descripcion = req.getParameter("descripcion");
		String etiquetasRaw = req.getParameter("etiquetas");

		response.setContentType("text/html");
		PrintWriter out = response.getWriter();

		if (action == null) {
			printResultado(out, "<font color='#DF0101'>Accion no especificada.</font>");
			return;
		}

		if ("Enviar".equals(action)) {
			Noticia noticia = new Noticia(fecha, jugador, parseInteres(interes), titulo, descripcion,
					NoticiaValidator.parseEtiquetas(etiquetasRaw));
			actionEnviar(out, noticia);
		} else if ("Recibir".equals(action)) {
			actionRecibir(out);
		} else if ("Leer".equals(action)) {
			actionLeer(out);
		} else if ("Obtener todas".equals(action)) {
			actionObtenerTodas(out);
		} else if ("Leer en".equals(action)) {
			String indiceRaw = req.getParameter("indice");
			try {
				int indice = Integer.parseInt(indiceRaw == null ? "" : indiceRaw.trim());
				actionLeerEn(out, indice);
			} catch (NumberFormatException e) {
				printResultado(out, "<font color='#DF0101'>Debes indicar un indice numerico valido.</font>");
			}
		} else {
			printResultado(out, "<font color='#DF0101'>Accion '" + action + "' no reconocida.</font>");
		}
	}

	private void getreference()
			throws org.omg.CORBA.ORBPackage.InvalidName, org.omg.CosNaming.NamingContextPackage.NotFound,
			org.omg.CosNaming.NamingContextPackage.CannotProceed, org.omg.CosNaming.NamingContextPackage.InvalidName,
			Exception {
		String orbHost = getConfiguredOrbHost();
		String orbPort = getConfiguredOrbPort();
		String bufferName = getConfiguredBufferName();

		// DEBUG: Print configuration values
		System.err.println("DEBUG: ORB Configuration:");
		System.err.println("  orbHost: " + orbHost);
		System.err.println("  orbPort: " + orbPort);
		System.err.println("  bufferName: " + bufferName);
		System.err.println("  Init Param 'orb.initial.host': " + getInitParameter("orb.initial.host"));
		System.err.println("  System Property 'org.omg.CORBA.ORBInitialHost': "
				+ System.getProperty("org.omg.CORBA.ORBInitialHost"));
		System.err.println("  System Property 'ORBInitialHost': " + System.getProperty("ORBInitialHost"));
		System.err.println("  Environment Variable 'ORB_INITIAL_HOST': " + System.getenv("ORB_INITIAL_HOST"));

		String args[] = new String[4];
		args[0] = "-ORBInitialPort";
		args[1] = orbPort;
		args[2] = "-ORBInitialHost";
		args[3] = orbHost;

		// Set CORBA properties to force use of configured host for all connections
		java.util.Properties props = new java.util.Properties();
		props.setProperty("com.sun.CORBA.transport.ORBUseInitialReferences", "true");
		props.setProperty("com.sun.CORBA.ORBAllowLocalOptimization", "true");
		props.setProperty("javax.CORBA.ORBInitialPort", orbPort);
		props.setProperty("javax.CORBA.ORBInitialHost", orbHost);
		props.setProperty("com.sun.CORBA.transport.ORBDefaultConnectionCache", "9");

		ORB orb = ORB.init(args, props);

		org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");

		// DEBUG: Log the IOR to see what host addresses are embedded
		String ior = orb.object_to_string(objRef);
		System.err.println("DEBUG: Initial NameService IOR: " + ior);
		System.err.println("DEBUG: Note: Will attempt narrow, and retry with fallback host if connection fails...");

		NamingContextExt ncRef = null;
		try {
			System.err.println("DEBUG: About to call NamingContextExtHelper.narrow()...");
			ncRef = NamingContextExtHelper.narrow(objRef);
			System.err.println("DEBUG: Successfully narrowed without exception!");
		} catch (org.omg.CORBA.COMM_FAILURE e) {
			System.err.println("DEBUG: COMM_FAILURE caught!");
			System.err
					.println("DEBUG: Connection failed with embedded address, attempting retry with fallback host...");
			System.err.println("DEBUG: Original error: " + e.getMessage());
			ncRef = retryWithFallbackHost(orbHost, orbPort, args, props);
		} catch (Exception e) {
			System.err.println("DEBUG: Different exception caught: " + e.getClass().getName());
			System.err.println("DEBUG: Exception: " + e.getMessage());
			e.printStackTrace(System.err);
			String errorMessage = e.getMessage();
			if (e instanceof org.omg.CORBA.SystemException
					|| (errorMessage != null && errorMessage.contains("Connection"))) {
				System.err.println("DEBUG: This looks like a connection error, attempting fallback...");
				ncRef = retryWithFallbackHost(orbHost, orbPort, args, props);
			} else {
				throw new IllegalStateException("No se ha podido resolver el NameService de CORBA.", e);
			}
		}

		if (ncRef == null) {
			throw new IllegalStateException("Failed to narrow NamingContextExt - could not resolve NameService");
		}
		try {
			bufferImpl = BufferHelper.narrow(ncRef.resolve_str(bufferName));
		} catch (NotFound primaryNotFound) {
			throw new IllegalStateException(
					"No se ha encontrado el servicio CORBA con nombre '" + bufferName
							+ "' en " + orbHost + ":" + orbPort
							+ ". Arranca el servidor de Act02_Corba_Server y comprueba orb.buffer.name.",
					primaryNotFound);
		}
	}

	private String getConfiguredOrbHost() {
		String host = getPreferredConfigValue("orb.initial.host", "ORB_INITIAL_HOST");
		if (host == null || host.trim().isEmpty()) {
			host = getPreferredConfigValue("org.omg.CORBA.ORBInitialHost", "ORBInitialHost");
		}
		if (host == null || host.trim().isEmpty()) {
			return DEFAULT_ORB_HOST;
		}
		return host.trim();
	}

	private String getConfiguredOrbPort() {
		String port = getPreferredConfigValue("orb.initial.port", "ORB_INITIAL_PORT");
		if (port == null || port.trim().isEmpty()) {
			port = getPreferredConfigValue("org.omg.CORBA.ORBInitialPort", "ORBInitialPort");
		}
		if (port == null || port.trim().isEmpty()) {
			port = DEFAULT_ORB_PORT;
		}

		String parsedPort = port.trim();
		try {
			int portNumber = Integer.parseInt(parsedPort);
			if (portNumber <= 0 || portNumber > 65535) {
				throw new IllegalStateException("Configuracion CORBA invalida: puerto fuera de rango [1..65535].");
			}
		} catch (NumberFormatException e) {
			throw new IllegalStateException("Configuracion CORBA invalida: puerto no numerico.", e);
		}

		return parsedPort;
	}

	private String getConfiguredBufferName() {
		String name = getPreferredConfigValue("orb.buffer.name", "ORB_BUFFER_NAME");
		if (name == null || name.trim().isEmpty()) {
			return DEFAULT_BUFFER_NAME;
		}
		return name.trim();
	}

	private boolean validateAgainstConfiguredXsd(String noticiaXML) {
		String configuredPath = getPreferredConfigValue("xml.schema.path", "XML_SCHEMA_PATH");
		if (configuredPath == null || configuredPath.trim().isEmpty()) {
			configuredPath = XSD_NOTICIAS;
		}

		String normalizedPath = configuredPath.trim();

		String webPath = normalizedPath.startsWith("/") ? normalizedPath : "/" + normalizedPath;
		InputStream schemaStream = getServletContext().getResourceAsStream(webPath);
		if (schemaStream != null) {
			try {
				return Validator.validateXMLContent(noticiaXML, schemaStream);
			} finally {
				try {
					schemaStream.close();
				} catch (IOException e) {
					// ignore close exception
				}
			}
		}

		File configuredFile = new File(normalizedPath);
		if (configuredFile.exists()) {
			return Validator.validateXMLContent(noticiaXML, configuredFile.getPath());
		}

		String realPath = getServletContext().getRealPath(webPath);
		if (realPath != null) {
			File deployedFile = new File(realPath);
			if (deployedFile.exists()) {
				return Validator.validateXMLContent(noticiaXML, deployedFile.getPath());
			}
		}

		InputStream classpathStream = Thread.currentThread().getContextClassLoader()
				.getResourceAsStream(normalizedPath);
		if (classpathStream != null) {
			try {
				return Validator.validateXMLContent(noticiaXML, classpathStream);
			} finally {
				try {
					classpathStream.close();
				} catch (IOException e) {
					// ignore close exception
				}
			}
		}

		throw new IllegalStateException("No se ha encontrado el esquema XSD configurado: " + normalizedPath
				+ ". Comprueba xml.schema.path y la publicacion del archivo en el WAR.");
	}

	private String getPreferredConfigValue(String key, String envKey) {
		String value = getInitParameter(key);
		if (value != null && !value.trim().isEmpty()) {
			return value;
		}

		value = System.getProperty(key);
		if (value != null && !value.trim().isEmpty()) {
			return value;
		}

		value = System.getenv(envKey);
		if (value != null && !value.trim().isEmpty()) {
			return value;
		}

		return null;
	}

	private NamingContextExt retryWithFallbackHost(String orbHost, String orbPort, String[] args,
			java.util.Properties props) throws Exception {
		System.err.println("DEBUG: Entering retryWithFallbackHost fallback logic...");

		// Try with direct connection to the configured host
		String[] args2 = new String[4];
		args2[0] = "-ORBInitialPort";
		args2[1] = orbPort;
		args2[2] = "-ORBInitialHost";
		args2[3] = orbHost;

		System.err.println("DEBUG: Creating new ORB with direct host=" + orbHost);
		ORB orb2 = ORB.init(args2, props);
		org.omg.CORBA.Object objRef2 = orb2.resolve_initial_references("NameService");
		System.err.println("DEBUG: Got object reference from new ORB, narrowing...");
		NamingContextExt ncRef2 = NamingContextExtHelper.narrow(objRef2);
		System.err.println("DEBUG: Successfully narrowed with fallback host!");
		return ncRef2;
	}

	private String getErrorMessage(Exception e) {
		if (e instanceof MARSHAL) {
			return "Incompatibilidad CORBA cliente/servidor: el servidor publicado no usa la misma interfaz Buffer de este proyecto.";
		}
		if (e instanceof BAD_OPERATION) {
			return "Operacion CORBA no soportada por el servidor publicado. Revisa que sea el servidor de Act02_Corba_Server con el IDL actualizado.";
		}
		if (e instanceof NotFound) {
			return "No se ha encontrado el nombre CORBA publicado en NameService. Arranca el servidor CORBA y revisa orb.buffer.name.";
		}
		String message = e.getMessage();
		if (message == null || message.trim().isEmpty()) {
			return e.getClass().getName();
		}
		return message;
	}

	private void printActions(PrintWriter out) {
		out.println("<div class='actions'>"
				+ "<input value='Enviar' type='submit' name='action'>"
				+ "<input value='Recibir' type='submit' name='action'>"
				+ "<input value='Leer' type='submit' name='action'>"
				+ "<input value='Obtener todas' type='submit' name='action'>"
				+ "<input value='Leer en' type='submit' name='action'>"
				+ "<input value='Reset' type='reset' name='resetAction'>"
				+ "</div>");
	}

	private void printForm(PrintWriter out, int nelementos) {
		out.println("<form action='http://localhost:8070/DK_News_Prod_Cons/servlet' method='post'>");
		out.println("<div class='field'><label for='fecha'>Fecha (dd/mm/aaaa):</label>");
		out.println("<input id='fecha' name='fecha' size='20'></div>");
		out.println("<div class='field'><label for='jugador'>Nombre del jugador (2-50 caracteres):</label>");
		out.println("<input id='jugador' name='jugador' size='60'></div>");
		out.println("<div class='field'><label for='interes'>Interes:</label>"
				+ "<select id='interes' name='interes'>"
				+ "<option value='alta'>alta</option>"
				+ "<option value='media'>media</option>"
				+ "<option value='baja'>baja</option>"
				+ "</select></div>");
		out.println("<div class='field'><label for='titulo'>Titulo:</label>"
				+ "<input id='titulo' name='titulo' size='60'></div>");
		out.println("<div class='field'><label for='descripcion'>Descripcion:</label>");
		out.println("<textarea id='descripcion' name='descripcion' rows='8' cols='70'></textarea></div>");
		out.println("<div class='field'><label for='etiquetas'>Etiquetas (ej: #musica #festival):</label>"
				+ "<input id='etiquetas' name='etiquetas' size='60'></div>");
		out.println("<div class='field'><label for='indice'>Indice para leer en:</label>"
				+ "<input id='indice' name='indice' type='number' min='0' size='10'></div>");
		out.println("<div class='field'><label>Límite máximo fijo:</label>"
				+ "<div class='buffer-count'>" + MAX_NOTICIAS + " noticias</div></div>");
		out.println("<p class='buffer-count'><strong>Numero de noticias en el Buffer:</strong> " + nelementos + "</p>");
	}

	private void printHeader(PrintWriter out) {
		out.println("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"
				+ "<meta name='Author' content='dsa069'>"
				+ "<meta name='Description' content='University of Almeria (Spain)'>"
				+ "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
				+ "<title>Gestor de Noticias Productor-Consumidor</title>"
				+ "<style>"
				+ ":root{--bg-1:#f7efe5;--bg-2:#e9f0ff;--panel:#ffffff;--ink:#1e293b;--brand:#0f766e;--brand-strong:#115e59;--line:#dbe3ef;--shadow:0 20px 45px rgba(15,23,42,.12);--radius:16px;}"
				+ "*{box-sizing:border-box;}"
				+ "body{margin:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:var(--ink);background:radial-gradient(circle at 18% 20%,rgba(15,118,110,.2),transparent 40%),radial-gradient(circle at 85% 8%,rgba(56,189,248,.2),transparent 35%),linear-gradient(120deg,var(--bg-1),var(--bg-2));min-height:100vh;padding:28px 14px;}"
				+ ".layout{max-width:920px;margin:0 auto;}"
				+ ".panel{background:var(--panel);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;}"
				+ ".header{padding:24px 28px 18px;background:linear-gradient(135deg,#0f766e,#0c4a6e);color:#fff;}"
				+ ".header h1{margin:0;font-size:1.6rem;font-weight:700;letter-spacing:.2px;}"
				+ ".header p{margin:8px 0 0;color:rgba(255,255,255,.9);font-size:.95rem;}"
				+ "form{padding:24px 28px 28px;}"
				+ ".field{margin-bottom:16px;}"
				+ "label{display:block;margin-bottom:7px;font-size:.92rem;font-weight:600;color:#0f172a;}"
				+ "input,select,textarea{width:100%;border:1px solid var(--line);background:#f8fafc;color:var(--ink);border-radius:10px;padding:10px 12px;font-size:.96rem;transition:border-color .2s ease,box-shadow .2s ease;}"
				+ "input:focus,select:focus,textarea:focus{outline:none;border-color:#22d3ee;box-shadow:0 0 0 3px rgba(34,211,238,.2);background:#fff;}"
				+ "textarea{resize:vertical;min-height:160px;}"
				+ ".buffer-count{margin:6px 0 2px;color:#334155;}"
				+ ".actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;}"
				+ ".actions input{width:auto;border:none;border-radius:999px;padding:9px 16px;font-weight:600;cursor:pointer;background:#e2e8f0;color:#0f172a;}"
				+ ".actions input[type='submit']{background:var(--brand);color:#fff;}"
				+ ".actions input[type='submit']:hover{background:var(--brand-strong);}"
				+ ".actions input[type='reset']{background:#dbeafe;color:#1e3a8a;}"
				+ ".news-list{margin:14px 0 0;padding-left:20px;}"
				+ ".news-list li{margin-bottom:10px;line-height:1.45;}"
				+ ".result{margin-top:18px;border-radius:10px;padding:12px 14px;background:#f8fafc;border:1px solid var(--line);}"
				+ "@media (max-width:720px){.header{padding:20px 18px 16px;}form{padding:18px;}.actions input{flex:1 1 140px;text-align:center;}}"
				+ "</style></head>");
		out.println("<body><main class='layout'><section class='panel'>"
				+ "<header class='header'><h1>Gestor de Noticias</h1><p>Formulario Productor-Consumidor</p></header>");
	}

	private void printResultado(PrintWriter out, String resultado) {
		printHeader(out);
		printForm(out, getNumElementosSafe());
		printActions(out);
		out.println("<div class='result'>" + resultado + "</div>");
		out.println("</form></section></main></body></html>");
	}

	private int getNumElementosSafe() {
		if (bufferImpl == null) {
			try {
				getreference();
			} catch (Exception e) {
				return -1;
			}
		}

		try {
			return bufferImpl.num_elementos();
		} catch (Exception e) {
			return -1;
		}
	}

	private String formatNoticia(Noticia noticia) {
		return "fecha=" + noticia.getFecha() + ", jugador=" + noticia.getJugador() + ", interes="
				+ noticia.getInteresValue() + ", titulo="
				+ noticia.getTitulo()
				+ ", descripcion=" + noticia.getDescripcion() + ", etiquetas=" + noticia.getEtiquetas();
	}

	private String joinErrors(List<String> errores) {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < errores.size(); i++) {
			if (i > 0) {
				sb.append(" ");
			}
			sb.append(errores.get(i));
		}
		return sb.toString();
	}

	private String safeValue(String value, String fallback) {
		if (value == null || value.trim().isEmpty()) {
			return fallback;
		}
		return value;
	}

	private Interes parseInteres(String interes) {
		return Interes.fromValue(interes);
	}
}
