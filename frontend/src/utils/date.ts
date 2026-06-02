/**
 * Retorna a data de hoje no formato YYYY-MM-DD (horário local).
 * Exemplo: 2026-05-20
 */
export function getTodayLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converte uma string de data YYYY-MM-DD para o formato DD/MM/YYYY (exibição).
 * Não usa o objeto Date, portanto não sofre interferência de fuso horário.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}