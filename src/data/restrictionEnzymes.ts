// src/data/restrictionEnzymes.ts

export interface RestrictionEnzyme {
  name: string
  site: string
  cutIndex: number
  overhang?: "5'" | "3'" | "blunt"
  category?: "common" | "extended"
  methylationSensitive?: boolean

  // New
  type?: "IIP" | "IIS"
  cutOffsetTop?: number
  cutOffsetBottom?: number
}

export const restrictionEnzymes: RestrictionEnzyme[] = [
  { name: "EcoRI", site: "GAATTC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "BamHI", site: "GGATCC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "HindIII", site: "AAGCTT", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "NotI", site: "GCGGCCGC", cutIndex: 2, overhang: "5'", category: "common" },
  { name: "XhoI", site: "CTCGAG", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "PstI", site: "CTGCAG", cutIndex: 5, overhang: "3'", category: "common" },
  { name: "SmaI", site: "CCCGGG", cutIndex: 3, overhang: "blunt", category: "common" },
  { name: "KpnI", site: "GGTACC", cutIndex: 5, overhang: "3'", category: "common" },
  { name: "NheI", site: "GCTAGC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "SpeI", site: "ACTAGT", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "SalI", site: "GTCGAC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "ApaI", site: "GGGCCC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "ClaI", site: "ATCGAT", cutIndex: 2, overhang: "5'", category: "common" },
  { name: "SacI", site: "GAGCTC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "SacII", site: "CCGCGG", cutIndex: 2, overhang: "5'", category: "common" },
  { name: "BglII", site: "AGATCT", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "NcoI", site: "CCATGG", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "NdeI", site: "CATATG", cutIndex: 2, overhang: "5'", category: "common" },
  { name: "MluI", site: "ACGCGT", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "AvrII", site: "CCTAGG", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "BspEI", site: "TCCGGA", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "AgeI", site: "ACCGGT", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "HaeIII", site: "GGCC", cutIndex: 2, overhang: "blunt", category: "common" },
  { name: "AluI", site: "AGCT", cutIndex: 2, overhang: "blunt", category: "common" },
  { name: "HinfI", site: "GANTC", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "MboI", site: "GATC", cutIndex: 0, overhang: "5'", category: "common" },
  { name: "DpnI", site: "GATC", cutIndex: 0, overhang: "5'", category: "common", methylationSensitive: true },
  { name: "TaqI", site: "TCGA", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "RsaI", site: "GTAC", cutIndex: 2, overhang: "blunt", category: "common" },
  { name: "MspI", site: "CCGG", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "HpaII", site: "CCGG", cutIndex: 1, overhang: "5'", category: "common", methylationSensitive: true },
  { name: "HpaI", site: "GTTAAC", cutIndex: 3, overhang: "blunt", category: "extended" },
  { name: "AflII", site: "CTTAAG", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "AatII", site: "GACGTC", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "BclI", site: "TGATCA", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "BstBI", site: "TTCGAA", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "EagI", site: "CGGCCG", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "FseI", site: "GGCCGGCC", cutIndex: 6, overhang: "5'", category: "extended" },
  { name: "KasI", site: "GGCGCC", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "NarI", site: "GGCGCC", cutIndex: 2, overhang: "5'", category: "extended" },
  { name: "NruI", site: "TCGCGA", cutIndex: 3, overhang: "blunt", category: "extended" },
  { name: "PacI", site: "TTAATTAA", cutIndex: 5, overhang: "blunt", category: "extended" },
  { name: "PmeI", site: "GTTTAAAC", cutIndex: 4, overhang: "blunt", category: "extended" },
  { name: "SbfI", site: "CCTGCAGG", cutIndex: 6, overhang: "5'", category: "extended" },
  { name: "StuI", site: "AGGCCT", cutIndex: 3, overhang: "blunt", category: "extended" },
  { name: "XbaI", site: "TCTAGA", cutIndex: 1, overhang: "5'", category: "common" },
  { name: "BsaI", site: "GGTCTC", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "BsmBI", site: "CGTCTC", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "SapI", site: "GCTCTTC", cutIndex: 1, overhang: "5'", category: "extended" },
  { name: "BstXI", site: "CCANNNNNNTGG", cutIndex: 8, overhang: "5'", category: "extended" },
  { name: "SfiI", site: "GGCCNNNNNGGCC", cutIndex: 8, overhang: "5'", category: "extended" }
]