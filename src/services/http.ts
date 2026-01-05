// src/services/http.ts
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

type ApiErrorResponse = {
  errors?: string[];
  message?: string;
};


const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const REFRESH_PATH = "/api/users/refresh-token";

/* ---------- token helpers ---------- */
const getAccess = () =>
  localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

const getRefresh = () =>
  localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

const setTokens = (access: string, refresh: string) => {
  const inLocal = !!localStorage.getItem("refresh_token");
  const storage: Storage = inLocal ? localStorage : sessionStorage;
  storage.setItem("access_token", access);
  storage.setItem("refresh_token", refresh);
};

const hardLogout = () => {
  try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ }
  if ("caches" in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  window.location.replace("/login");
};

/* ---------- create axios client (no explicit axios types used) ---------- */
const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 30_000,
});

/* ---------- REQUEST interceptor ---------- */
client.interceptors.request.use((config: any) => {
  const url = config.url || "";
  const isLogout = url.includes("/api/users/logout");
  const isRefresh = url.includes(REFRESH_PATH);

  const access = getAccess();
  const refresh = getRefresh();
  const bearer = (isLogout || isRefresh) ? refresh : access;

  config.headers = config.headers || {};
  if (bearer) (config.headers as any).Authorization = `Bearer ${bearer}`;

  if (!(config.data instanceof FormData)) {
    (config.headers as any)["Content-Type"] = "application/json";
    (config.headers as any).Accept = "application/json";
  }

  const AUTH_PATHS = ["/api/users/login", "/api/users/logout", REFRESH_PATH];
  const isExcluded = AUTH_PATHS.some((p) => url.includes(p));

  if (!isExcluded) {
    let role = localStorage.getItem("role") || "";
    if (!role) {
      try {
        const arr = JSON.parse(localStorage.getItem("roles") || "[]");
        role = Array.isArray(arr) ? (arr[0] || "") : "";
      } catch { /* ignore */ }
    }
    const countyId = localStorage.getItem("county_id") || sessionStorage.getItem("county_id") || "";
    const userEmail = localStorage.getItem("user_email") || sessionStorage.getItem("user_email") || "";

    if (role) (config.headers as any).Roles = role;
    if (countyId) (config.headers as any).countyid = countyId;
    if (userEmail) (config.headers as any).useremail = userEmail;
  }

  return config;
}, (err: any) => Promise.reject(err));

/* ---------- refresh flow (single-flight + queue) ---------- */
let isRefreshing = false;
let waiters: Array<(token: string) => void> = [];
const publish = (t: string) => { waiters.forEach(cb => cb(t)); waiters = []; };

const doRefresh = async (): Promise<string> => {
  const refresh = getRefresh();
  if (!refresh) throw new Error("No refresh token");

  // use bare axios to avoid this client's interceptors
  const resp = await axios.post(
    `${BASE_URL}${REFRESH_PATH}`,
    {},
    { headers: { Authorization: `Bearer ${refresh}` } }
  );

  const dat: any = resp?.data ?? {};

  // support multiple shapes from backend
  const newAccess = dat?.jwtToken ?? dat?.access_token ?? dat?.data?.access_token;
  const newRefresh = dat?.jwtRefreshToken ?? dat?.refresh_token ?? dat?.data?.refresh_token;

  if (!newAccess || !newRefresh) throw new Error("Invalid refresh response");

  setTokens(newAccess, newRefresh);
  return newAccess;
};

/* ---------- RESPONSE interceptor ---------- */
client.interceptors.response.use(
  (r: any) => r,
  async (error: AxiosError & { config?: any }) => {
    const status = error.response?.status;
    const original: any = error.config || {};
    // const apiErrorMessage =
    //   (error.response?.data?.errors && Array.isArray((error.response?.data as any)?.errors) && (error.response?.data as any).errors[0]) ||
    //   (error.response?.data as any)?.message ||
    //   error.message ||
    //   "Something went wrong";

    const data = error.response?.data as ApiErrorResponse | undefined;

    const apiErrorMessage =
      (data?.errors && Array.isArray(data.errors) && data.errors[0]) ||
      data?.message ||
      error.message ||
      "Something went wrong";


    if (status !== 401 || !original) {
      toast.error(apiErrorMessage);
      hardLogout();
      return Promise.reject(error.response?.data ?? error);
    }

    const url = original.url || "";

    if (url.includes("/api/users/login")) {
      return Promise.reject(error);
    }

    if (url.includes(REFRESH_PATH)) {
      hardLogout();
      return Promise.reject(error.response?.data ?? error);
    }

    if (original._retry) {
      hardLogout();
      return Promise.reject(error.response?.data ?? error);
    }
    original._retry = true;

    try {
      const newAccess: string = await new Promise<string>((resolve, reject) => {
        waiters.push(resolve);

        if (!isRefreshing) {
          isRefreshing = true;
          doRefresh()
            .then((token) => {
              publish(token);
              isRefreshing = false;
            })
            .catch((err) => {
              isRefreshing = false;
              publish("");
              hardLogout();
              reject(err);
            });
        }
      });

      if (!newAccess) throw new Error("Failed to refresh token");

      original.headers = original.headers || {};
      (original.headers as any).Authorization = `Bearer ${newAccess}`;

      return client(original);
    } catch (err) {
      return Promise.reject(err);
    }
  }
);

export default client;
