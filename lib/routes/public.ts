export const PUBLIC_ROUTES = {
  home: "/",
  campuses: "/campuses",
  yearbook: "/yearbook",
  clubs: "/clubs",
  admission: "/admission",
} as const;

export function portalUrl(params?: { id?: string; email?: string }) {
  const search = new URLSearchParams();
  search.set("tab", "track");
  if (params?.id) search.set("id", params.id.trim().toUpperCase());
  if (params?.email) search.set("email", params.email.trim().toLowerCase());
  return `${PUBLIC_ROUTES.admission}?${search.toString()}`;
}
