/**
 * Data Utilities
 * Helper functions for working with entities and relationships
 */

/**
 * Get all entities (characters, events, settings) related to a specific entity
 */
export function getRelatedEntities(entityId, relationships, repository) {
  const related = {
    characters: [],
    events: [],
    settings: [],
  }

  const rels = relationships.filter((rel) => rel.sourceId === entityId || rel.targetId === entityId)

  rels.forEach((rel) => {
    const targetId = rel.sourceId === entityId ? rel.targetId : rel.sourceId
    const targetType = rel.sourceId === entityId ? rel.targetType : rel.sourceType

    if (targetType === 'character') {
      const char = repository.getCharacter(targetId)
      if (char && !related.characters.find((c) => c.id === char.id)) {
        related.characters.push(char)
      }
    } else if (targetType === 'event') {
      const event = repository.getEvent(targetId)
      if (event && !related.events.find((e) => e.id === event.id)) {
        related.events.push(event)
      }
    } else if (targetType === 'setting') {
      const setting = repository.getSetting(targetId)
      if (setting && !related.settings.find((s) => s.id === setting.id)) {
        related.settings.push(setting)
      }
    }
  })

  return related
}

/**
 * Get all relationships for an entity with populated data
 */
export function getRelationshipsWithData(entityId, relationships, repository) {
  return relationships
    .filter((rel) => rel.sourceId === entityId || rel.targetId === entityId)
    .map((rel) => {
      const isSource = rel.sourceId === entityId
      const otherId = isSource ? rel.targetId : rel.sourceId
      const otherType = isSource ? rel.targetType : rel.sourceType

      let otherEntity = null
      if (otherType === 'character') {
        otherEntity = repository.getCharacter(otherId)
      } else if (otherType === 'event') {
        otherEntity = repository.getEvent(otherId)
      } else if (otherType === 'setting') {
        otherEntity = repository.getSetting(otherId)
      }

      return {
        ...rel,
        otherEntity,
        otherType,
        direction: isSource ? 'outgoing' : 'incoming',
      }
    })
}

/**
 * Find path between two characters through relationships
 */
export function findCharacterPath(char1Id, char2Id, relationships, maxDepth = 5) {
  const visited = new Set()
  const queue = [{ id: char1Id, path: [char1Id] }]

  while (queue.length > 0) {
    const { id, path } = queue.shift()

    if (id === char2Id) {
      return path
    }

    if (visited.has(id) || path.length - 1 >= maxDepth) {
      continue
    }

    visited.add(id)

    const connectedRels = relationships.filter(
      (rel) =>
        (rel.sourceId === id || rel.targetId === id) &&
        rel.sourceType === 'character' &&
        rel.targetType === 'character',
    )

    connectedRels.forEach((rel) => {
      const nextId = rel.sourceId === id ? rel.targetId : rel.sourceId
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] })
      }
    })
  }

  return null // No path found
}

/**
 * Get connected components (groups of connected characters)
 */
export function getCharacterCommunities(relationships) {
  const graph = new Map()
  const visited = new Set()
  const communities = []

  // Build adjacency list
  relationships.forEach((rel) => {
    if (rel.sourceType === 'character' && rel.targetType === 'character') {
      if (!graph.has(rel.sourceId)) {
        graph.set(rel.sourceId, [])
      }
      if (!graph.has(rel.targetId)) {
        graph.set(rel.targetId, [])
      }

      graph.get(rel.sourceId).push(rel.targetId)
      if (rel.bidirectional) {
        graph.get(rel.targetId).push(rel.sourceId)
      }
    }
  })

  // Find connected components using DFS
  graph.forEach((_, startNode) => {
    if (visited.has(startNode)) {
      return
    }

    const community = []
    const stack = [startNode]

    while (stack.length > 0) {
      const node = stack.pop()
      if (visited.has(node)) {
        continue
      }

      visited.add(node)
      community.push(node)

      ;(graph.get(node) || []).forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor)
        }
      })
    }

    if (community.length > 0) {
      communities.push(community)
    }
  })

  return communities
}

/**
 * Get statistics about character relationships
 */
export function getCharacterNetworkStats(relationships) {
  const connections = new Map()
  const relationshipTypes = new Map()

  relationships
    .filter((rel) => rel.sourceType === 'character' && rel.targetType === 'character')
    .forEach((rel) => {
      // Count connections per character
      if (!connections.has(rel.sourceId)) {
        connections.set(rel.sourceId, 0)
      }
      connections.set(rel.sourceId, connections.get(rel.sourceId) + 1)

      if (!connections.has(rel.targetId)) {
        connections.set(rel.targetId, 0)
      }
      connections.set(rel.targetId, connections.get(rel.targetId) + 1)

      // Count relationship types
      if (!relationshipTypes.has(rel.relationshipType)) {
        relationshipTypes.set(rel.relationshipType, 0)
      }
      relationshipTypes.set(rel.relationshipType, relationshipTypes.get(rel.relationshipType) + 1)
    })

  const maxConnections = Math.max(...connections.values(), 0)
  const hubCharacters = Array.from(connections.entries())
    .filter(([, count]) => count === maxConnections)
    .map(([id]) => id)

  return {
    totalCharacters: connections.size,
    totalRelationships: relationships.filter(
      (rel) => rel.sourceType === 'character' && rel.targetType === 'character',
    ).length,
    averageConnections:
      connections.size > 0
        ? Array.from(connections.values()).reduce((a, b) => a + b, 0) / connections.size
        : 0,
    maxConnections,
    hubCharacters,
    relationshipTypes: Object.fromEntries(relationshipTypes),
  }
}

/**
 * Search entities across all types
 */
export function globalSearch(query, repository) {
  const lowerQuery = query.toLowerCase()
  const results = {
    characters: [],
    events: [],
    settings: [],
  }

  repository.getAllCharacters().forEach((char) => {
    if (
      char.name.toLowerCase().includes(lowerQuery) ||
      char.aliases?.some((alias) => alias.toLowerCase().includes(lowerQuery)) ||
      char.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    ) {
      results.characters.push(char)
    }
  })

  repository.getAllEvents().forEach((event) => {
    if (
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description?.toLowerCase().includes(lowerQuery) ||
      event.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    ) {
      results.events.push(event)
    }
  })

  repository.getAllSettings().forEach((setting) => {
    if (
      setting.name.toLowerCase().includes(lowerQuery) ||
      setting.description?.toLowerCase().includes(lowerQuery) ||
      setting.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    ) {
      results.settings.push(setting)
    }
  })

  return results
}

/**
 * Duplicate a book with all its entities
 */
export async function duplicateBook(sourceBookId, newBookData, repository) {
  const sourceChars = repository.getCharactersByBook(sourceBookId)
  const sourceEvents = repository.getEventsByBook(sourceBookId)
  const sourceSettings = repository.getSettingsByBook(sourceBookId)
  const sourceRels = repository.getRelationshipsByBook(sourceBookId)

  const idMap = new Map() // Map old IDs to new IDs

  // TODO: This is a template for duplication logic
  // In a real scenario, you would generate new IDs and create new entities

  return {
    book: newBookData,
    characters: sourceChars,
    events: sourceEvents,
    settings: sourceSettings,
    relationships: sourceRels,
    idMap,
  }
}
