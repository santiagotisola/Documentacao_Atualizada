import React from 'react';
import { Navigate } from 'react-router-dom';

/* Aba Chamados — Redireciona para o Hub Unificado no Helpdesk */

function Chamados() {
  return <Navigate to="/central-atendimento?tab=helpdesk" replace />;
}

export default Chamados;
