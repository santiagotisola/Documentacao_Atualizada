import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3100/api";

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

export const api = axios.create({
  baseURL: getApiUrl()
});
