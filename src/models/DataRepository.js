/**
 * Data Repository
 * Provides data access patterns and caching for entities
 */

export class DataRepository {
  constructor() {
    this.cache = {
      characters: new Map(),
      events: new Map(),
      settings: new Map(),
      relationships: new Map(),
      books: new Map(),
    }
  }

  /**
   * Character management
   */

  addCharacter(character) {
    this.cache.characters.set(character.id, character)
  }

  getCharacter(characterId) {
    return this.cache.characters.get(characterId)
  }

  getCharactersByBook(bookId) {
    return Array.from(this.cache.characters.values()).filter((c) => c.bookId === bookId)
  }

  getAllCharacters() {
    return Array.from(this.cache.characters.values())
  }

  updateCharacter(character) {
    this.cache.characters.set(character.id, character)
  }

  deleteCharacter(characterId) {
    this.cache.characters.delete(characterId)
  }

  /**
   * Event management
   */

  addEvent(event) {
    this.cache.events.set(event.id, event)
  }

  getEvent(eventId) {
    return this.cache.events.get(eventId)
  }

  getEventsByBook(bookId) {
    return Array.from(this.cache.events.values())
      .filter((e) => e.bookId === bookId)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
  }

  getAllEvents() {
    return Array.from(this.cache.events.values())
  }

  updateEvent(event) {
    this.cache.events.set(event.id, event)
  }

  deleteEvent(eventId) {
    this.cache.events.delete(eventId)
  }

  /**
   * Setting management
   */

  addSetting(setting) {
    this.cache.settings.set(setting.id, setting)
  }

  getSetting(settingId) {
    return this.cache.settings.get(settingId)
  }

  getSettingsByBook(bookId) {
    return Array.from(this.cache.settings.values()).filter((s) => s.bookId === bookId)
  }

  getAllSettings() {
    return Array.from(this.cache.settings.values())
  }

  updateSetting(setting) {
    this.cache.settings.set(setting.id, setting)
  }

  deleteSetting(settingId) {
    this.cache.settings.delete(settingId)
  }

  /**
   * Relationship management
   */

  addRelationship(relationship) {
    this.cache.relationships.set(relationship.id, relationship)
  }

  getRelationship(relationshipId) {
    return this.cache.relationships.get(relationshipId)
  }

  getRelationshipsByBook(bookId) {
    return Array.from(this.cache.relationships.values()).filter((r) => r.bookId === bookId)
  }

  getRelationshipsForEntity(entityId, entityType = null) {
    return Array.from(this.cache.relationships.values()).filter((rel) => {
      if (entityType) {
        return (
          (rel.sourceId === entityId && rel.sourceType === entityType) ||
          (rel.targetId === entityId && rel.targetType === entityType)
        )
      }
      return rel.sourceId === entityId || rel.targetId === entityId
    })
  }

  getAllRelationships() {
    return Array.from(this.cache.relationships.values())
  }

  updateRelationship(relationship) {
    this.cache.relationships.set(relationship.id, relationship)
  }

  deleteRelationship(relationshipId) {
    this.cache.relationships.delete(relationshipId)
  }

  /**
   * Book management
   */

  addBook(book) {
    this.cache.books.set(book.id, book)
  }

  getBook(bookId) {
    return this.cache.books.get(bookId)
  }

  getBooksByUser(userId) {
    return Array.from(this.cache.books.values()).filter((b) => b.userId === userId)
  }

  getAllBooks() {
    return Array.from(this.cache.books.values())
  }

  updateBook(book) {
    this.cache.books.set(book.id, book)
  }

  deleteBook(bookId) {
    this.cache.books.delete(bookId)
  }

  /**
   * Batch operations
   */

  addMany(type, entities) {
    entities.forEach((entity) => {
      this.cache[type].set(entity.id, entity)
    })
  }

  /**
   * Clear cache
   */

  clearCache() {
    Object.keys(this.cache).forEach((key) => {
      this.cache[key].clear()
    })
  }

  clearBookData(bookId) {
    this.cache.characters = new Map(
      Array.from(this.cache.characters.entries()).filter(([, char]) => char.bookId !== bookId),
    )
    this.cache.events = new Map(
      Array.from(this.cache.events.entries()).filter(([, event]) => event.bookId !== bookId),
    )
    this.cache.settings = new Map(
      Array.from(this.cache.settings.entries()).filter(([, setting]) => setting.bookId !== bookId),
    )
    this.cache.relationships = new Map(
      Array.from(this.cache.relationships.entries()).filter(([, rel]) => rel.bookId !== bookId),
    )
  }

  /**
   * Get repository statistics
   */

  getStats() {
    return {
      characterCount: this.cache.characters.size,
      eventCount: this.cache.events.size,
      settingCount: this.cache.settings.size,
      relationshipCount: this.cache.relationships.size,
      bookCount: this.cache.books.size,
    }
  }
}
