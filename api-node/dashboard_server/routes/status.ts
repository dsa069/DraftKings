import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import os from "os";

const router = Router();

// Ruta principal para el panel de estado: GET /status
router.get("/", (req: Request, res: Response) => {
  // 1. Estado de Mongoose (0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando)
  const dbStatusInt = mongoose.connection.readyState;
  let dbStatus = "Desconectado";
  let dbStatusClass = "badge-danger";

  if (dbStatusInt === 1) {
    dbStatus = "Conectado";
    dbStatusClass = "badge-success";
  } else if (dbStatusInt === 2) {
    dbStatus = "Conectando...";
    dbStatusClass = "badge-warning";
  }

  // 2. Métricas del Sistema Operativo y Node
  const uptimeSeconds = process.uptime();
  const uptimeString = formatUptime(uptimeSeconds);

  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(os.totalmem() / 1024 / 1024);
  const freeMemoryMB = Math.round(os.freemem() / 1024 / 1024);

  res.render("status", {
    title: "Panel de Estado — DraftKings REST API",
    status: {
      environment: process.env.NODE_ENV || "development",
      dbStatus,
      dbStatusClass,
      uptime: uptimeString,
      memoryUsed: memoryUsedMB,
      memoryTotal: memoryTotalMB,
      memoryFree: freeMemoryMB,
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      timestamp: new Date().toLocaleString(),
    },
  });
});

// Función auxiliar para formatear el tiempo activo
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? `${d}d ` : "";
  const hDisplay = h > 0 ? `${h}h ` : "";
  const mDisplay = m > 0 ? `${m}m ` : "";
  const sDisplay = `${s}s`;
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

export default router;
