/**
 * Relationship Model
 * Represents connections between characters, events, or settings
 */
export class Relationship {
  constructor({
    id = null,
    bookId = null,
    sourceId = null, // character, event, or setting id
    sourceType = '', // 'character', 'event', 'setting'
    targetId = null, // related entity id
    targetType = '', // 'character', 'event', 'setting'
    relationshipType = '', // e.g., 'sibling', 'parent', 'spouse', 'mentor', 'enemy', 'love-interest', 'witnessed', 'caused', 'describes'
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
    return new Relationship({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })
  }

  toFirestore() {
    const data = { ...this }
    delete data.id
    return data
  }

  /**
   * Get the reverse relationship for genealogy/family tree views
   */
  getReverseRelationshipType() {
    const reverseMap = {
      parent: 'child',
      child: 'parent',
      sibling: 'sibling',
      spouse: 'spouse',
      mentor: 'mentee',
      mentee: 'mentor',
      enemy: 'enemy',
      ally: 'ally',
      'love-interest': 'love-interest',
    }
    return reverseMap[this.relationshipType] || this.relationshipType
  }
}
