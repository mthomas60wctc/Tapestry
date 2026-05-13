/**
 * Relationship Model
 * Represents connections between characters, events, or settings in a graph structure
 * All entity connections (character-to-event, character-to-setting, etc.) are modeled as relationships
 */

import { toModelDate } from './dateValue'

// Relationship type constants
export const RELATIONSHIP_TYPES = {
  // Character to Character
  PARENT: 'parent',
  CHILD: 'child',
  SIBLING: 'sibling',
  SPOUSE: 'spouse',
  MENTOR: 'mentor',
  MENTEE: 'mentee',
  ENEMY: 'enemy',
  ALLY: 'ally',
  LOVE_INTEREST: 'love-interest',

  // Character to Event
  APPEARS_IN: 'appears-in',
  PARTICIPATES_IN: 'participates-in',
  WITNESSES: 'witnesses',
  INITIATES: 'initiates',
  CAUSES: 'causes',

  // Character to Setting
  LIVES_IN: 'lives-in',
  VISITS: 'visits',
  RULES: 'rules',
  BORN_IN: 'born-in',
  DIES_IN: 'dies-in',

  // Event to Setting
  OCCURS_AT: 'occurs-at',
  TAKES_PLACE_IN: 'takes-place-in',

  // Setting to Setting (hierarchical)
  PARENT_LOCATION: 'parent-location',
  CHILD_LOCATION: 'child-location',
}

export class Relationship {
  constructor({
    id = null,
    bookId = null,
    sourceId = null, // character, event, or setting id
    sourceType = '', // 'character', 'event', 'setting'
    targetId = null, // related entity id
    targetType = '', // 'character', 'event', 'setting'
    relationshipType = '', // edge type constant from RELATIONSHIP_TYPES
    description = '', // additional context
    strength = 'medium', // 'weak', 'medium', 'strong' - for visualization purposes
    bidirectional = false, // if true, relationship goes both ways with same type
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id
    this.bookId = bookId
    this.sourceId = sourceId
    this.sourceType = sourceType
    this.targetId = targetId
    this.targetType = targetType
    this.relationshipType = relationshipType
    this.description = description
    this.strength = strength
    this.bidirectional = bidirectional
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(doc) {
    const data = doc.data()
    return new Relationship({
      id: doc.id,
      ...data,
      createdAt: toModelDate(data.createdAt, new Date()),
      updatedAt: toModelDate(data.updatedAt, new Date()),
    })
  }

  toFirestore() {
    const data = { ...this }
    delete data.id
    return data
  }

  /**
   * Get the reverse relationship type (static)
   * For genealogy/family tree views or to show relationships from the opposite direction
   */
  static getReverseRelationshipType(relationshipType) {
    const reverseMap = {
      // Character to Character
      [RELATIONSHIP_TYPES.PARENT]: RELATIONSHIP_TYPES.CHILD,
      [RELATIONSHIP_TYPES.CHILD]: RELATIONSHIP_TYPES.PARENT,
      [RELATIONSHIP_TYPES.SIBLING]: RELATIONSHIP_TYPES.SIBLING,
      [RELATIONSHIP_TYPES.SPOUSE]: RELATIONSHIP_TYPES.SPOUSE,
      [RELATIONSHIP_TYPES.MENTOR]: RELATIONSHIP_TYPES.MENTEE,
      [RELATIONSHIP_TYPES.MENTEE]: RELATIONSHIP_TYPES.MENTOR,
      [RELATIONSHIP_TYPES.ENEMY]: RELATIONSHIP_TYPES.ENEMY,
      [RELATIONSHIP_TYPES.ALLY]: RELATIONSHIP_TYPES.ALLY,
      [RELATIONSHIP_TYPES.LOVE_INTEREST]: RELATIONSHIP_TYPES.LOVE_INTEREST,

      // Character to Event
      [RELATIONSHIP_TYPES.APPEARS_IN]: RELATIONSHIP_TYPES.APPEARS_IN,
      [RELATIONSHIP_TYPES.PARTICIPATES_IN]: RELATIONSHIP_TYPES.PARTICIPATES_IN,
      [RELATIONSHIP_TYPES.WITNESSES]: RELATIONSHIP_TYPES.WITNESSES,
      [RELATIONSHIP_TYPES.INITIATES]: RELATIONSHIP_TYPES.INITIATES,
      [RELATIONSHIP_TYPES.CAUSES]: RELATIONSHIP_TYPES.CAUSES,

      // Character to Setting
      [RELATIONSHIP_TYPES.LIVES_IN]: RELATIONSHIP_TYPES.LIVES_IN,
      [RELATIONSHIP_TYPES.VISITS]: RELATIONSHIP_TYPES.VISITS,
      [RELATIONSHIP_TYPES.RULES]: RELATIONSHIP_TYPES.RULES,
      [RELATIONSHIP_TYPES.BORN_IN]: RELATIONSHIP_TYPES.BORN_IN,
      [RELATIONSHIP_TYPES.DIES_IN]: RELATIONSHIP_TYPES.DIES_IN,

      // Event to Setting or Setting to Setting
      [RELATIONSHIP_TYPES.OCCURS_AT]: RELATIONSHIP_TYPES.OCCURS_AT,
      [RELATIONSHIP_TYPES.TAKES_PLACE_IN]: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      [RELATIONSHIP_TYPES.PARENT_LOCATION]: RELATIONSHIP_TYPES.CHILD_LOCATION,
      [RELATIONSHIP_TYPES.CHILD_LOCATION]: RELATIONSHIP_TYPES.PARENT_LOCATION,
    }
    return reverseMap[relationshipType] || relationshipType
  }

  /**
   * Get the reverse relationship type (instance)
   */
  getReverseRelationshipType() {
    return Relationship.getReverseRelationshipType(this.relationshipType)
  }

  /**
   * Get the display label for a relationship type
   */
  static getDisplayLabel(relationshipType) {
    const labels = {
      // Character to Character
      [RELATIONSHIP_TYPES.PARENT]: 'Parent',
      [RELATIONSHIP_TYPES.CHILD]: 'Child',
      [RELATIONSHIP_TYPES.SIBLING]: 'Sibling',
      [RELATIONSHIP_TYPES.SPOUSE]: 'Spouse',
      [RELATIONSHIP_TYPES.MENTOR]: 'Mentor',
      [RELATIONSHIP_TYPES.MENTEE]: 'Mentee',
      [RELATIONSHIP_TYPES.ENEMY]: 'Enemy',
      [RELATIONSHIP_TYPES.ALLY]: 'Ally',
      [RELATIONSHIP_TYPES.LOVE_INTEREST]: 'Love Interest',

      // Character to Event
      [RELATIONSHIP_TYPES.APPEARS_IN]: 'Appears In',
      [RELATIONSHIP_TYPES.PARTICIPATES_IN]: 'Participates In',
      [RELATIONSHIP_TYPES.WITNESSES]: 'Witnesses',
      [RELATIONSHIP_TYPES.INITIATES]: 'Initiates',
      [RELATIONSHIP_TYPES.CAUSES]: 'Causes',

      // Character to Setting
      [RELATIONSHIP_TYPES.LIVES_IN]: 'Lives In',
      [RELATIONSHIP_TYPES.VISITS]: 'Visits',
      [RELATIONSHIP_TYPES.RULES]: 'Rules',
      [RELATIONSHIP_TYPES.BORN_IN]: 'Born In',
      [RELATIONSHIP_TYPES.DIES_IN]: 'Dies In',

      // Event to Setting
      [RELATIONSHIP_TYPES.OCCURS_AT]: 'Occurs At',
      [RELATIONSHIP_TYPES.TAKES_PLACE_IN]: 'Takes Place In',

      // Setting to Setting
      [RELATIONSHIP_TYPES.PARENT_LOCATION]: 'Parent Location',
      [RELATIONSHIP_TYPES.CHILD_LOCATION]: 'Child Location',
    }
    return labels[relationshipType] || relationshipType.replace('-', ' ')
  }

  /**
   * Check if this is a special relationship type (for detail view highlighting)
   * Special types are character-to-character genealogy relationships
   */
  static isSpecialRelationshipType(relationshipType) {
    const specialTypes = [
      RELATIONSHIP_TYPES.PARENT,
      RELATIONSHIP_TYPES.CHILD,
      RELATIONSHIP_TYPES.SIBLING,
      RELATIONSHIP_TYPES.SPOUSE,
      RELATIONSHIP_TYPES.MENTOR,
      RELATIONSHIP_TYPES.MENTEE,
      RELATIONSHIP_TYPES.ENEMY,
      RELATIONSHIP_TYPES.ALLY,
      RELATIONSHIP_TYPES.LOVE_INTEREST,
    ]
    return specialTypes.includes(relationshipType)
  }

  /**
   * Get compatible relationship types for a given entity pair
   */
  static getValidRelationshipTypes(sourceType, targetType) {
    const key = `${sourceType}-${targetType}`
    const reverseKey = `${targetType}-${sourceType}`

    const typeMap = {
      'character-character': [
        RELATIONSHIP_TYPES.PARENT,
        RELATIONSHIP_TYPES.CHILD,
        RELATIONSHIP_TYPES.SIBLING,
        RELATIONSHIP_TYPES.SPOUSE,
        RELATIONSHIP_TYPES.MENTOR,
        RELATIONSHIP_TYPES.MENTEE,
        RELATIONSHIP_TYPES.ENEMY,
        RELATIONSHIP_TYPES.ALLY,
        RELATIONSHIP_TYPES.LOVE_INTEREST,
      ],
      'character-event': [
        RELATIONSHIP_TYPES.APPEARS_IN,
        RELATIONSHIP_TYPES.PARTICIPATES_IN,
        RELATIONSHIP_TYPES.WITNESSES,
        RELATIONSHIP_TYPES.INITIATES,
        RELATIONSHIP_TYPES.CAUSES,
      ],
      'event-character': [
        RELATIONSHIP_TYPES.APPEARS_IN,
        RELATIONSHIP_TYPES.PARTICIPATES_IN,
        RELATIONSHIP_TYPES.WITNESSES,
        RELATIONSHIP_TYPES.INITIATES,
        RELATIONSHIP_TYPES.CAUSES,
      ],
      'character-setting': [
        RELATIONSHIP_TYPES.LIVES_IN,
        RELATIONSHIP_TYPES.VISITS,
        RELATIONSHIP_TYPES.RULES,
        RELATIONSHIP_TYPES.BORN_IN,
        RELATIONSHIP_TYPES.DIES_IN,
      ],
      'setting-character': [
        RELATIONSHIP_TYPES.LIVES_IN,
        RELATIONSHIP_TYPES.VISITS,
        RELATIONSHIP_TYPES.RULES,
        RELATIONSHIP_TYPES.BORN_IN,
        RELATIONSHIP_TYPES.DIES_IN,
      ],
      'event-setting': [RELATIONSHIP_TYPES.OCCURS_AT, RELATIONSHIP_TYPES.TAKES_PLACE_IN],
      'setting-event': [RELATIONSHIP_TYPES.OCCURS_AT, RELATIONSHIP_TYPES.TAKES_PLACE_IN],
      'setting-setting': [RELATIONSHIP_TYPES.PARENT_LOCATION, RELATIONSHIP_TYPES.CHILD_LOCATION],
    }

    return typeMap[key] || typeMap[reverseKey] || []
  }
}
