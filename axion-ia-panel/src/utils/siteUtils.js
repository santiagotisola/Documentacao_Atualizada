/* ═══════════════════════════════════════════════════════════════════
   SITE UTILS — funções utilitárias compartilhadas sobre sites
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Retorna a cor baseada no health score (0-100)
 */
export function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/**
 * Calcula o health score composto de um site com base em OCR, versão e chamados.
 * @param {object} site - objeto do site (ocr, versao, id)
 * @param {object|null} chamadosData - retorno do endpoint /helpdesk/sites-overview
 * @returns {number} score de 0 a 100
 */
export function calcHealthScore(site, chamadosData) {
  let score = 100;
  if (site.ocr) score -= Math.max(0, (95 - site.ocr) * 0.5);
  else score -= 10;
  if (site.versao && site.versao < 'v.1.2.0') score -= 10;
  const siteChamados = chamadosData?.ranking?.find(r => r.siteId === site.id);
  if (siteChamados) {
    score -= Math.min(30, siteChamados.abertos * 2);
    score -= Math.min(20, (siteChamados.criticos || 0) * 5);
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
