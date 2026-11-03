const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function randomUuidFromCrypto(): string | null {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject === undefined) {
    return null;
  }
  if (typeof cryptoObject.randomUUID !== 'function') {
    return null;
  }
  return cryptoObject.randomUUID();
}

function randomUuidFallback(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomNibble = Math.floor(Math.random() * 16);
    if (char === 'x') {
      return randomNibble.toString(16);
    }
    return ((randomNibble & 0x3) | 0x8).toString(16);
  });
}

/** Identificador único compatible con web, Expo Go y entornos sin `crypto.randomUUID`. */
export function createId(): string {
  return randomUuidFromCrypto() ?? randomUuidFallback();
}

export function isUuidV4(value: string): boolean {
  return UUID_V4_PATTERN.test(value);
}
