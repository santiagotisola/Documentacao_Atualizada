/**
 * mission.routes.js
 * Rotas do Mission Engine
 */

import express from "express";
import {
  listarMissions, detalheMission, criarMission,
  iniciarMission, concluirMission, cancelarMission,
  adicionarEvidencia, statsMissions, missionsPorCliente,
} from "../mission-controller.js";

const router = express.Router();

// ─── CRUD ────────────────────────────────────────────────────────────────────

router.get("/missions",                    listarMissions);
router.get("/missions/stats",              statsMissions);
router.get("/missions/:id",                detalheMission);
router.post("/missions",                   criarMission);

// ─── CICLO DE VIDA ────────────────────────────────────────────────────────────

router.post("/missions/:id/iniciar",       iniciarMission);
router.post("/missions/:id/concluir",      concluirMission);
router.post("/missions/:id/cancelar",      cancelarMission);
router.post("/missions/:id/evidencias",    adicionarEvidencia);

// ─── POR CLIENTE ─────────────────────────────────────────────────────────────

router.get("/missions/cliente/:slug",      missionsPorCliente);

export default router;
