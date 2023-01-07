export function base64EncodeURL(byteArray: Uint8Array) {
  return btoa(Array.from(new Uint8Array(byteArray)).map(val => {
    return String.fromCharCode(val)
  }).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/\\=/g, '')
}

export function base64DecodeURL(b64urlstring: string) {
  return new Uint8Array(atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/')).split('').map(val => {
    return val.charCodeAt(0)
  }))
}