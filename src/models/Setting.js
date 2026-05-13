/**
 * Setting Model
 * Represents a location, place, or environment
 */
export class Setting {
  constructor({
    id = null,
    bookId = null,
    name = '',
    aliases = [],
    type = '', // 'kingdom', 'city', 'building', 'region', 'planet', etc.
    description = '',
    geography = '', // geographical details
    climate = '',
    population = null,
    ruler = '', // who governs it
    firstAppearance = null, // event id
    imageUrl = null,
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id
    this.bookId = bookId
    this.name = name
    this.aliases = aliases
    this.type = type
    this.description = description
    this.geography = geography
    this.climate = climate
    this.population = population
    this.ruler = ruler
    this.firstAppearance = firstAppearance
    this.imageUrl = imageUrl
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(doc) {
    return new Setting({
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
}
