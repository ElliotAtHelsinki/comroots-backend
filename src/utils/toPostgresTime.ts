export const toPostgresTime = (cursor: string) => {
  const date = (new Date(parseInt(cursor)))
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}