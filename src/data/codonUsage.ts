import codonUsage from "./codonUsage_top150.json"

export const speciesCodonUsage =
  codonUsage as Record<string, Record<string, number>>

export type Species = keyof typeof speciesCodonUsage

export const speciesList: Species[] =
  Object.keys(speciesCodonUsage) as Species[]