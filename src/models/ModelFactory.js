/**
 * Model Factory
 * Factory functions for creating model instances with defaults
 */

import { Character, Event, Setting, Relationship, Book } from './index.js'

export class ModelFactory {
  /**
   * Create a new Character instance
   */
  static createCharacter(overrides = {}) {
    return new Character(overrides)
  }

  /**
   * Create a new Event instance
   */
  static createEvent(overrides = {}) {
    return new Event(overrides)
  }

  /**
   * Create a new Setting instance
   */
  static createSetting(overrides = {}) {
    return new Setting(overrides)
  }

  /**
   * Create a new Relationship instance
   */
  static createRelationship(overrides = {}) {
    return new Relationship(overrides)
  }

  /**
   * Create a new Book instance
   */
  static createBook(overrides = {}) {
    return new Book(overrides)
  }

  /**
   * Create a family relationship between two characters
   */
  static createFamilyRelationship(sourceCharacterId, targetCharacterId, familyType, bookId) {
    return new Relationship({
      bookId,
      sourceId: sourceCharacterId,
      sourceType: 'character',
      targetId: targetCharacterId,
      targetType: 'character',
      relationshipType: familyType, // 'parent', 'child', 'sibling', 'spouse'
      strength: 'strong',
      bidirectional: ['sibling', 'spouse'].includes(familyType),
    })
  }

  /**
   * Create a hierarchical relationship between characters
   */
  static createHierarchyRelationship(supervisorId, subordinateId, relationshipType, bookId) {
    return new Relationship({
      bookId,
      sourceId: supervisorId,
      sourceType: 'character',
      targetId: subordinateId,
      targetType: 'character',
      relationshipType, // 'supervises', 'reports-to', 'leads'
      strength: 'medium',
      bidirectional: false,
    })
  }

  /**
   * Create an event-character relationship (participation)
   */
  static createEventParticipation(eventId, characterId, bookId) {
    return new Relationship({
      bookId,
      sourceId: eventId,
      sourceType: 'event',
      targetId: characterId,
      targetType: 'character',
      relationshipType: 'participated-in',
      strength: 'medium',
    })
  }

  /**
   * Create a character-setting relationship
   */
  static createCharacterLocationRelationship(characterId, settingId, relationshipType, bookId) {
    return new Relationship({
      bookId,
      sourceId: characterId,
      sourceType: 'character',
      targetId: settingId,
      targetType: 'setting',
      relationshipType, // 'resident-of', 'visited', 'rules', etc.
      strength: 'medium',
    })
  }

  /**
   * Batch create relationships
   */
  static createRelationships(relationships = []) {
    return relationships.map((rel) => new Relationship(rel))
  }
}
