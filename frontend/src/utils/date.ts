export function getTodayLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const cleanDate = dateString.includes('T') ? dateString.split('T')[0] : dateString
  const [year, month, day] = cleanDate.split('-')
  return `${day}/${month}/${year}`
}