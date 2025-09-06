// features/login/token.store.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "app_access_token"; // "Bearer xxx"
const REFRESH_KEY = "app_refresh_token";
const isWeb = Platform.OS === "web";
let memAccess: string | null = null;
let memRefresh: string | null = null;

const ensureBearer = (t?: string | null) =>
  !t ? null : t.startsWith("Bearer ") ? t : `Bearer ${t}`;

async function _setAccess(v: string | null) {
  memAccess = v;
  if (isWeb) {
    if (v == null) localStorage.removeItem(ACCESS_KEY);
    else localStorage.setItem(ACCESS_KEY, v);
  } else {
    if (v == null) await SecureStore.deleteItemAsync(ACCESS_KEY);
    else await SecureStore.setItemAsync(ACCESS_KEY, v);
  }
}
async function _getAccess(): Promise<string | null> {
  if (memAccess) return memAccess;
  memAccess = isWeb
    ? localStorage.getItem(ACCESS_KEY)
    : ((await SecureStore.getItemAsync(ACCESS_KEY)) ?? null);
  return memAccess;
}

async function _setRefresh(v: string | null) {
  memRefresh = v;
  if (isWeb) {
    if (v == null) localStorage.removeItem(REFRESH_KEY);
    else localStorage.setItem(REFRESH_KEY, v);
  } else {
    if (v == null) await SecureStore.deleteItemAsync(REFRESH_KEY);
    else await SecureStore.setItemAsync(REFRESH_KEY, v);
  }
}

async function _getRefresh(): Promise<string | null> {
  if (memRefresh) return memRefresh;
  memRefresh = isWeb
    ? localStorage.getItem(REFRESH_KEY)
    : ((await SecureStore.getItemAsync(REFRESH_KEY)) ?? null);
  return memRefresh;
}

export async function saveAccessTokenOnly(access: string) {
  await _setAccess(ensureBearer(access));
}
export async function loadAccessTokenOnly(): Promise<string | null> {
  return _getAccess();
}
export async function clearAccessTokenOnly() {
  await _setAccess(null);
}
export async function bootstrapAccessToken() {
  await _getAccess();
}
export function getAccessTokenCached() {
  return memAccess;
}
export function setAccessTokenCached(v: string | null) {
  memAccess = v;
}

export async function saveRefreshTokenOnly(refresh: string) {
  await _setRefresh(refresh);
}
export async function loadRefreshTokenOnly(): Promise<string | null> {
  return _getRefresh();
}
export async function clearRefreshTokenOnly() {
  await _setRefresh(null);
}
export function getRefreshTokenCached() {
  return memRefresh;
}
export function setRefreshTokenCached(v: string | null) {
  memRefresh = v;
}

// 호환용
export async function saveTokens(params: { access?: string | null; refresh?: string | null }) {
  if (typeof params.access !== "undefined") await _setAccess(ensureBearer(params.access ?? null));
  if (typeof params.refresh !== "undefined") await _setRefresh(params.refresh);
}
export async function loadTokens(): Promise<{ access: string | null; refresh: string | null }> {
  return { access: await _getAccess(), refresh: await _getRefresh() };
}
export async function clearTokens() {
  await _setAccess(null);
  await _setRefresh(null);
}
export async function bootstrapTokens() {
  await _getAccess();
  await _getRefresh();
}
