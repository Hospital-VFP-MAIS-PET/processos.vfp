export const parsePrice = (priceStr: string): number => {
  const cleanPrice = priceStr.replace('R$', '').trim()
  const lastCommaIndex = cleanPrice.lastIndexOf(',')
  const lastDotIndex = cleanPrice.lastIndexOf('.')
  const lastSeparatorIndex = Math.max(lastCommaIndex, lastDotIndex)

  if (lastSeparatorIndex > -1) {
    const beforeDecimal = cleanPrice.substring(0, lastSeparatorIndex).replace(/[\.,]/g, '')
    const afterDecimal = cleanPrice.substring(lastSeparatorIndex + 1)
    return parseFloat(beforeDecimal + '.' + afterDecimal) || 0
  }
  return parseFloat(cleanPrice) || 0
}
