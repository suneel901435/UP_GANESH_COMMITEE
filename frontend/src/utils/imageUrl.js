// Turns a backend-relative image path (e.g. "/uploads/velam-items/xyz.png")
// into a full URL the browser can load, regardless of which API base URL is
// configured for this deployment. Used anywhere a VelamItem.imageUrl (or any
// other /uploads/** path) needs to be rendered in an <img>.
export function getFullImageUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`
}
