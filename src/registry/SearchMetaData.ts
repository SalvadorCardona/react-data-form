import { BaseJsonLdItemInterface } from "@/registry/jsonLd/jsonLDItem"
import {
  getResource,
  resourceRegistered,
} from "@/registry/ResourceInterface"

export function searchMetaData<T = BaseJsonLdItemInterface>(
  query: BaseJsonLdItemInterface & { "@for"?: string[] }
): T | undefined {
  // 1. Si l'ID correspond exactement, c'est le gagnant immédiat
  const exactMatch = getResource<T>(query)
  if (exactMatch) return exactMatch

  let bestMatch: BaseJsonLdItemInterface | undefined = undefined
  let maxScore = 0

  const candidates = Object.values(resourceRegistered)

  for (const candidate of candidates) {
    let score = 0

    // 2. Score fort pour le même @type
    if (query["@type"] && candidate["@type"] === query["@type"]) {
      score += 20
    }

    // 3. Score cumulatif pour les éléments communs dans @for
    if (query["@for"] && candidate["@for"]) {
      const intersection = query["@for"].filter((tag) =>
        candidate["@for"]?.includes(tag)
      )
      score += intersection.length * 10
    }

    // On garde le candidat avec le score le plus élevé
    if (score > 0 && score > maxScore) {
      maxScore = score
      bestMatch = candidate
    }
  }

  return bestMatch as T | undefined
}
