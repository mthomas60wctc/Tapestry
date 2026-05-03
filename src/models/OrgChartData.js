/**
 * OrgChartData Model
 * Specialized data structure for organizational hierarchy visualization
 * Represents power structures, command chains, organizational hierarchies
 */
export class OrgChartData {
  constructor({
    bookId = null,
    organizations = {}, // keyed by organization name or id
    relationships = [], // Relationship objects with hierarchy types
  } = {}) {
    this.bookId = bookId
    this.organizations = organizations
    this.relationships = relationships
  }

  /**
   * Hierarchy relationship types
   */
  static HIERARCHY_RELATIONSHIPS = [
    'reports-to',
    'supervises',
    'leads',
    'member-of',
    'head-of',
    'founder',
  ]

  /**
   * Build an organizational hierarchy tree for a given organization or leader
   */
  buildOrgTree(rootCharacterId, relationships, orgName = null) {
    const visited = new Set()

    const buildNode = (characterId, depth = 0, maxDepth = 5) => {
      if (depth > maxDepth || visited.has(characterId)) {
        return null
      }

      visited.add(characterId)

      const node = {
        characterId,
        title: null,
        organization: orgName,
        subordinates: [],
        peers: [],
        superiors: [],
        departments: [],
        depth,
      }

      // Find all hierarchy relationships involving this character
      const hierarchyRels = relationships.filter(
        (rel) =>
          (rel.sourceId === characterId || rel.targetId === characterId) &&
          OrgChartData.HIERARCHY_RELATIONSHIPS.includes(rel.relationshipType),
      )

      hierarchyRels.forEach((rel) => {
        const otherCharacterId = rel.sourceId === characterId ? rel.targetId : rel.sourceId
        const relType =
          rel.sourceId === characterId ? rel.relationshipType : rel.getReverseRelationshipType()

        if (relType === 'reports-to') {
          node.superiors.push(buildNode(otherCharacterId, depth - 1, maxDepth))
        } else if (relType === 'supervises' || relType === 'leads' || relType === 'head-of') {
          node.subordinates.push(buildNode(otherCharacterId, depth + 1, maxDepth))
        } else if (relType === 'member-of') {
          // Organization membership
          node.organization = rel.description || orgName
        } else if (relType === 'founder') {
          node.title = 'Founder'
        }
      })

      return node
    }

    return buildNode(rootCharacterId)
  }

  /**
   * Get all members of an organization
   */
  getOrganizationMembers(orgName, relationships) {
    const members = []
    const memberRels = relationships.filter(
      (rel) => rel.relationshipType === 'member-of' && rel.description === orgName,
    )

    memberRels.forEach((rel) => {
      members.push(rel.sourceId)
    })

    return members
  }

  /**
   * Get reporting chain (chain of command from character to top)
   */
  getReportingChain(characterId, relationships) {
    const chain = [characterId]
    let currentId = characterId
    const visited = new Set([currentId])

    while (true) {
      const supervisorRel = relationships.find(
        (rel) => rel.sourceId === currentId && rel.relationshipType === 'reports-to',
      )

      if (!supervisorRel || visited.has(supervisorRel.targetId)) {
        break
      }

      chain.push(supervisorRel.targetId)
      visited.add(supervisorRel.targetId)
      currentId = supervisorRel.targetId
    }

    return chain
  }

  /**
   * Get direct reports (subordinates) of a character
   */
  getDirectReports(characterId, relationships) {
    return relationships
      .filter((rel) => rel.sourceId === characterId && rel.relationshipType === 'supervises')
      .map((rel) => rel.targetId)
  }

  /**
   * Get organization hierarchy levels
   */
  getHierarchyLevels(relationships) {
    const levels = {}

    relationships.forEach((rel) => {
      if (rel.relationshipType === 'reports-to') {
        if (!levels[rel.targetId]) {
          levels[rel.targetId] = 0
        }
        if (!levels[rel.sourceId]) {
          levels[rel.sourceId] = levels[rel.targetId] + 1
        }
      }
    })

    return levels
  }

  /**
   * Extract hierarchy relationships
   */
  filterHierarchyRelationships() {
    return this.relationships.filter((rel) =>
      OrgChartData.HIERARCHY_RELATIONSHIPS.includes(rel.relationshipType),
    )
  }
}
