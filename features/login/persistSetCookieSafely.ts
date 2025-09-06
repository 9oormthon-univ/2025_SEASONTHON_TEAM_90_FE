// utils/cookies/persistSetCookieSafely.ts
import CookieManager from "@react-native-cookies/cookies";

function pickAttr(attrs: string[], key: string) {
  const found = attrs.find((a) =>
    a
      .trim()
      .toLowerCase()
      .startsWith(key.toLowerCase() + "="),
  );
  return found?.split("=")[1];
}

/**
 * Axios 응답 헤더의 Set-Cookie를 파싱하여 RN CookieManager에 안전하게 저장
 * - origin 예: "https://habiglow.duckdns.org"
 */
export async function persistSetCookieSafely(origin: string, headers: any) {
  try {
    const raw = headers?.["set-cookie"] ?? headers?.["Set-Cookie"] ?? headers?.setCookie ?? null;
    if (!raw) return;

    const list: string[] = Array.isArray(raw) ? raw : [raw];
    for (const c of list) {
      const parts = String(c).split(";");
      const [nv, ...attrs] = parts;
      const [name, ...vparts] = nv.trim().split("=");
      const value = vparts.join("=") ?? "";

      const path = pickAttr(attrs, "Path") || "/";
      const domain = pickAttr(attrs, "Domain");
      const maxAge = pickAttr(attrs, "Max-Age");
      const expiresAttr = attrs.find((a) => a.toLowerCase().includes("expires="));
      const secure = attrs.some((a) => a.trim().toLowerCase() === "secure");
      const httpOnly = attrs.some((a) => a.trim().toLowerCase() === "httponly");

      let expires: string | undefined;
      if (maxAge && !Number.isNaN(Number(maxAge))) {
        expires = new Date(Date.now() + Number(maxAge) * 1000).toISOString();
      } else if (expiresAttr) {
        const ev = expiresAttr.split("=")[1]?.trim();
        const d = ev ? new Date(ev) : null;
        if (d && !isNaN(d.getTime())) expires = d.toISOString();
      }

      await CookieManager.set(origin, {
        name,
        value,
        path,
        domain,
        expires,
        secure,
        httpOnly,
      });
    }
  } catch (e) {
    console.warn("[Cookie] persistSetCookieSafely error", e);
  }
}
