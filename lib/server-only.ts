export function ensureServerOnly(moduleName: string) {
  if (typeof window !== 'undefined') {
    throw new Error(`${moduleName} can only be imported from the server.`)
  }
}
