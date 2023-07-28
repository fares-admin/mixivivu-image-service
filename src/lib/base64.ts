export const encodeBase64 = (data: string) => {
  return Buffer.from(data).toString('base64')
}

export const encodeBase64Url = (data: string) => {
  return Buffer.from(data).toString('base64url')
}

export const decodeBase64 = (data: string) => {
  return Buffer.from(data, 'base64').toString('ascii')
}
