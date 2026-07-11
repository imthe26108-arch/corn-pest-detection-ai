export function getApiUrl(path: string) {
  return `/api/${path.replace(/^\/?api\//, '').replace(/^\/+/, '')}`;
}
