import { utils } from 'koilib'

const ENCRYPTION_SALT_KEY = 'ENCRYPTION_SALT'
const ENCRYPTION_IV_KEY = 'ENCRYPTION_IV'

export function loadEncryptionSalt() {
  return localStorage.getItem(ENCRYPTION_SALT_KEY)
}

export function saveEncryptionSalt(encryptionSalt: string) {
  localStorage.setItem(ENCRYPTION_SALT_KEY, encryptionSalt)
}

export function loadEncryptionIV() {
  return localStorage.getItem(ENCRYPTION_IV_KEY)
}

export function saveEncryptionIV(encryptionIV: string) {
  localStorage.setItem(ENCRYPTION_IV_KEY, encryptionIV)
}

function getEncryptionOptions(): {
  salt: ArrayBufferLike;
  iv: ArrayBufferLike;
} {
  let saltString = loadEncryptionSalt()
  let ivString = loadEncryptionIV()

  if (!saltString || !ivString) {
    saltString = utils.toHexString(window.crypto.getRandomValues(new Uint8Array(16)))
    ivString = utils.toHexString(window.crypto.getRandomValues(new Uint8Array(12)))
    saveEncryptionSalt(saltString!)
    saveEncryptionIV(ivString!)
  }
  const salt = utils.toUint8Array(saltString).buffer
  const iv = utils.toUint8Array(ivString).buffer
  return { salt, iv }
}

function getCryptoKey(password: string) {
  let enc = new TextEncoder()
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
}

async function getEncryptionKey(password: string, salt: ArrayBufferLike) {
  const cryptoKey = await getCryptoKey(password)
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    cryptoKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function encrypt<T>(
  data: T,
  password: string
): Promise<string> {
  const { salt, iv } = getEncryptionOptions()
  const key = await getEncryptionKey(password, salt)
  const message = JSON.stringify(data)
  const encoded = new TextEncoder().encode(message)

  const bufferEncrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  )

  return utils.toHexString(new Uint8Array(bufferEncrypted))
}

export async function decrypt<T>(
  encrypted: string,
  password: string
): Promise<T> {
  const { salt, iv } = getEncryptionOptions()
  const key = await getEncryptionKey(password, salt)
  let bufferEncrypted

  try {
    bufferEncrypted = utils.toUint8Array(encrypted)
  } catch (error) {
    throw new Error(`Invalid encryted value (${encrypted})`)
  }

  let decrypted
  try {
    decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      bufferEncrypted
    )
  } catch (error) {
    throw new Error('Invalid password')
  }

  try {
    const message = new TextDecoder().decode(decrypted)
    return JSON.parse(message)
  } catch (error) {
    throw new Error('Decrypted value cannot be decoded and parsed to JSON')
  }
}