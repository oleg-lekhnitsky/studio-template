export function balanceMasonry<T>(items: T[], columnCount: number, heightOf: (item: T) => number) {
  const count = Math.max(1, Math.floor(columnCount))
  const columns: T[][] = Array.from({ length: count }, () => [])
  const heights = Array<number>(count).fill(0)

  for (const item of items) {
    let shortest = 0
    for (let index = 1; index < count; index++) {
      if (heights[index]! < heights[shortest]!) shortest = index
    }
    columns[shortest]!.push(item)
    heights[shortest]! += Math.max(0, heightOf(item))
  }

  return columns
}
