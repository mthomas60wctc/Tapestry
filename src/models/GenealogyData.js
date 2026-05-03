/**
 * GenealogyData Model
 * Specialized data structure for genealogy/family tree visualization
 * Organizes character relationships in family structures
 */
export class GenealogyData {
  constructor({
    bookId = null,
    familyTrees = {}, // keyed by root ancestor id
    relationships = [], // Relationship objects with family types
  } = {}) {
    this.bookId = bookId
    this.familyTrees = familyTrees
    this.relationships = relationships
  }

  /**
   * Build a family tree starting from a root character
   * Returns nested tree structure
   */
  buildFamilyTree(rootCharacterId, relationships, maxDepth = 5) {
    const visited = new Set()

    const buildNode = (characterId, depth) => {
      if (depth > maxDepth || visited.has(characterId)) {
        return null
      }

      visited.add(characterId)

      const node = {
        characterId,
        parents: [],
        children: [],
        siblings: [],
        spouse: null,
        depth,
      }

      // Find all relationships involving this character
      const relatedRels = relationships.filter(
        (rel) =>
          (rel.sourceId === characterId || rel.targetId === characterId) &&
          ['parent', 'child', 'sibling', 'spouse'].includes(rel.relationshipType),
      )

      relatedRels.forEach((rel) => {
        const otherCharacterId = rel.sourceId === characterId ? rel.targetId : rel.sourceId
        const relType =
          rel.sourceId === characterId ? rel.relationshipType : rel.getReverseRelationshipType()

        if (relType === 'parent') {
          node.parents.push(buildNode(otherCharacterId, depth + 1))
        } else if (relType === 'child') {
          node.children.push(buildNode(otherCharacterId, depth + 1))
        } else if (relType === 'sibling') {
          node.siblings.push(buildNode(otherCharacterId, depth + 1))
        } else if (relType === 'spouse') {
          node.spouse = buildNode(otherCharacterId, depth + 1)
        }
      })

      return node
    }

    return buildNode(rootCharacterId, 0)
  }

  /**
   * Get all family relationship types
   */
  static FAMILY_RELATIONSHIPS = [
    'parent',
    'child',
    'sibling',
    'spouse',
    'grandparent',
    'grandchild',
    'aunt-uncle',
    'cousin',
  ]

  /**
   * Extract family relationships from a set of relationships
   */
  filterFamilyRelationships() {
    return this.relationships.filter((rel) =>
      GenealogyData.FAMILY_RELATIONSHIPS.includes(rel.relationshipType),
    )
  }

  /**
   * Get common ancestors between two characters
   */
  getCommonAncestors(char1Id, char2Id, relationships) {
    const getAncestors = (characterId, visited = new Set()) => {
      if (visited.has(characterId)) return new Set()
      visited.add(characterId)

      const ancestors = new Set()
      ancestors.add(characterId)

      const parentRels = relationships.filter(
        (rel) => rel.targetId === characterId && rel.relationshipType === 'child',
      )

      parentRels.forEach((rel) => {
        getAncestors(rel.sourceId, visited).forEach((ancestor) => ancestors.add(ancestor))
      })

      return ancestors
    }

    const ancestors1 = getAncestors(char1Id)
    const ancestors2 = getAncestors(char2Id)

    return [...ancestors1].filter((id) => ancestors2.has(id))
  }

  /**
   * Calculate relationship degree between two characters
   */
  getRelationshipDegree(char1Id, char2Id, relationships) {
    const visited = new Map()

    const findPath = (currentId, targetId, depth = 0) => {
      if (currentId === targetId) {
        return depth
      }

      if (visited.has(currentId)) {
        return null
      }

      visited.set(currentId, true)

      const connectedRels = relationships.filter(
        (rel) =>
          (rel.sourceId === currentId || rel.targetId === currentId) &&
          GenealogyData.FAMILY_RELATIONSHIPS.includes(rel.relationshipType),
      )

      for (const rel of connectedRels) {
        const nextId = rel.sourceId === currentId ? rel.targetId : rel.sourceId
        const result = findPath(nextId, targetId, depth + 1)
        if (result !== null) {
          return result
        }
      }

      return null
    }

    return findPath(char1Id, char2Id)
  }
}
