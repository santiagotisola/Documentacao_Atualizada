import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3100/api";
const DEFAULT_API_TOKEN = "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3";

function getApiUrl() {
  return localStorage.getItem("axionia_api_url") || DEFAULT_API_URL;
}

export function setApiUrl(url) {
  localStorage.setItem("axionia_api_url", url);
  api.defaults.baseURL = url;
}

export function getConfiguredUrl() {
  return getApiUrl();
}

export function getApiToken() {
  return localStorage.getItem("axionia_api_token") || DEFAULT_API_TOKEN;
}

export function setApiToken(token) {
  localStorage.setItem("axionia_api_token", token);
}

export const api = axios.create({
  baseURL: getApiUrl()
});

// ─── Interceptor: injetar token em toda requisição ────────────────────────────
api.interceptors.request.use((config) => {
  const token = getApiToken();
  if (token) {
    config.headers["x-api-token"] = token;
  }
  return config;
});

// ─── Interceptor: mensagens de erro específicas ───────────────────────────────
const MENSAGENS_ERRO = {
  401: "Token de autenticação ausente. Configure o token em Configurações.",
  403: "Token inválido. Verifique o token em Configurações.",
  429: "Cota da OpenAI esgotada. Funcionalidades de IA estão temporariamente indisponíveis.",
  503: "Serviço não configurado. Verifique as configurações no painel.",
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      // Preserva a mensagem original do servidor se houver
      if (!data?.erro && MENSAGENS_ERRO[status]) {
        error.response.data = { ...data, erro: MENSAGENS_ERRO[status] };
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helper para páginas que usam fetch() nativo ─────────────────────────────
// Uso: import { apiFetch } from "../services/api";
//      const r = await apiFetch("/helpdesk/tickets");
export function apiFetch(path, opts = {}) {
  const base = getApiUrl();
  const token = getApiToken();
  const isFormData = opts.body instanceof FormData;
  const headers = { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(opts.headers || {}) };
  if (token) headers["x-api-token"] = token;
  return fetch(`${base}${path}`, { ...opts, headers });
}
