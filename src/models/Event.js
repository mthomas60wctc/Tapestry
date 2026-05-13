/**
 * Event Model
 * Represents a story event, scene, or chapter moment
 */
import { toModelDate } from './dateValue'

export class Event {
  constructor({
    id = null,
    bookId = null,
    title = '',
    description = '',
    chapter = null,
    chapterTitle = '',
    pageStart = null,
    pageEnd = null,
    sequenceOrder = 0, // numeric order for timeline sorting
    internalDate = null, // story-world date if applicable
    arc = '', // story arc identifier (e.g., 'romance', 'political-intrigue')
    emotionalTone = '', // 'happy', 'tragic', 'tense', 'turning-point', etc.
    tags = [],
    notes = '',
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id
    this.bookId = bookId
    this.title = title
    this.description = description
    this.chapter = chapter
    this.chapterTitle = chapterTitle
    this.pageStart = pageStart
    this.pageEnd = pageEnd
    this.sequenceOrder = sequenceOrder
    this.internalDate = internalDate
    this.arc = arc
    this.emotionalTone = emotionalTone
    this.tags = tags
    this.notes = notes
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(doc) {
    const data = doc.data()
    return new Event({
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
   * Get timeline sort key based on sequence order or chapter
   */
  getTimelineKey() {
    return this.sequenceOrder || this.chapter || 0
  }
}
