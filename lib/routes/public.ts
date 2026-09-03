export const PORTAL_PATH = "/portal";

export function portalUrl(params?: { id?: string; email?: string }) {
  const search = new URLSearchParams();
  if (params?.id) search.set("id", params.id.trim().toUpperCase());
  if (params?.email) search.set("email", params.email.trim().toLowerCase());
  const query = search.toString();
  return query ? `${PORTAL_PATH}?${query}` : PORTAL_PATH;
}
