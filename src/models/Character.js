/**
 * Character Model
 */
import { toModelDate } from './dateValue'

export class Character {
  constructor({
    id = null,
    bookId = null,
    name = '',
    aliases = [],
    status = 'active', // active, deceased, unknown, retired
    role = 'supporting', // protagonist, antagonist, supporting, mentor, love-interest, etc.
    description = '',
    firstAppearance = null, // event id or chapter reference
    background = '',
    imageUrl = null,
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id
    this.bookId = bookId
    this.name = name
    this.aliases = aliases
    this.status = status
    this.role = role
    this.description = description
    this.firstAppearance = firstAppearance
    this.background = background
    this.imageUrl = imageUrl
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(doc) {
    const data = doc.data()
    return new Character({
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
}
