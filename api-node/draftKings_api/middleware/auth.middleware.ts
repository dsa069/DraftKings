import { Request, Response, NextFunction } from "express";
import { authAdmin } from "./config/firebase.config";
import { User } from "../models/user";

/**
 * Middleware para autorizar peticiones mediante Firebase IdToken y validación en DB local.
 * Sigue la semántica de errores estricta requerida en el PDF de la asignatura.
 */
export async function authorizeRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // 1. Obtener y normalizar la cabecera Authorization
    const header = req.headers.authorization;

    // 2. Comprobar si la cabecera existe y comienza con 'Bearer '
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // 3. Extraer el token de la cabecera
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // 4. Verificar el token usando el SDK de administración de Firebase
    const decodedToken = await authAdmin.verifyIdToken(token);

    // 5. Consultar la base de datos (Mongoose) buscando por el UID de Firebase
    // Se replican exactamente los filtros de elegibilidad del PDF: is_active: true, blocked: false
    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
      is_active: true,
      blocked: false,
    });

    // Hook Opcional / Integración configurable: Si el usuario está autenticado en Firebase
    // pero es su primera petición a la API backend, lo registramos localmente de forma automática.
    if (!user) {
      // Nota: Si el usuario existía pero fue bloqueado/desactivado manualmente en el backend,
      // el query de arriba dará null. Verificamos si existe de verdad antes de auto-crear:
      const userExistsButInvalid = await User.exists({
        firebaseUid: decodedToken.uid,
      });

      if (userExistsButInvalid) {
        // Si existe pero falló el filtro de arriba, significa que está inactivo o bloqueado
        return res.status(401).json({ message: "Petición no autorizada" });
      }

      // Si es completamente nuevo, realizamos el aprovisionamiento "Just-In-Time"

      // Verificación de seguridad: Un usuario debe tener un email para ser creado en nuestro sistema.
      if (!decodedToken.email) {
        // Este caso es muy raro, pero es una salvaguarda importante.
        return res
          .status(400)
          .json({ message: "El token de usuario no contiene un email." });
      }

      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        // El displayName de Firebase es opcional
        userName: decodedToken.name,
        // Mapeo de custom claims si existieran, con un rol por defecto
        role: (decodedToken.role as string) || "USER",
        is_active: true,
        blocked: false,
      });
    }

    // 6. Adjuntar la información procesada al objeto de solicitud Express
    req.user = user;
    req.firebaseUser = decodedToken;

    // 7. Continuar con la siguiente función en la cadena
    return next();
  } catch (error) {
    // Control de errores de Firebase (token expirado, inválido, etc.) y errores del servidor
    console.error("Error en el Middleware de Autorización:", error);
    // Para cumplir con el requisito del PDF, cualquier fallo resulta en 401
    return res.status(401).json({ message: "Petición no autorizada" });
  }
}

/**
 * Middleware para autorizar peticiones mediante Firebase IdToken sin creación automática.
 * Este middleware SOLO valida el JWT y busca el usuario en la DB.
 * Si el usuario no existe, devuelve 401 Unauthorized.
 * Úsalo en rutas de lectura/consulta donde se requiere que el usuario esté ya registrado.
 */
export async function authorizeRequestNoCreate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // 1. Obtener y normalizar la cabecera Authorization
    const header = req.headers.authorization;

    // 2. Comprobar si la cabecera existe y comienza con 'Bearer '
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // 3. Extraer el token de la cabecera
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // 4. Verificar el token usando el SDK de administración de Firebase
    const decodedToken = await authAdmin.verifyIdToken(token);

    // 5. Consultar la base de datos (Mongoose) buscando por el UID de Firebase
    const user = await User.findOne({
      firebaseUid: decodedToken.uid,
      is_active: true,
      blocked: false,
    });

    // 6. Si el usuario no existe o está inactivo/bloqueado, rechazar la petición
    if (!user) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // 7. Adjuntar la información procesada al objeto de solicitud Express
    req.user = user;
    req.firebaseUser = decodedToken;

    // 8. Continuar con la siguiente función en la cadena
    return next();
  } catch (error) {
    // Control de errores de Firebase (token expirado, inválido, etc.) y errores del servidor
    console.error("Error en el Middleware de Autorización (NoCreate):", error);
    // Para cumplir con el requisito del PDF, cualquier fallo resulta en 401
    return res.status(401).json({ message: "Petición no autorizada" });
  }
}
