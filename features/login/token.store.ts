// features/login/token.store.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "app_access_token"; // "Bearer xxx"
const isWeb = Platform.OS === "web";
let memAccess: string | null = null;

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

export async function saveAccessTokenOnly(access: string | null) {
  await _setAccess(ensureBearer(access ?? null));
}
export async function loadAccessTokenOnly(): Promise<string | null> {
  return _getAccess();
}
export async function clearAccessTokenOnly() {
  await _setAccess(null);
}
export function getAccessTokenCached() {
  return memAccess;
}
export function setAccessTokenCached(v: string | null) {
  memAccess = v;
}
