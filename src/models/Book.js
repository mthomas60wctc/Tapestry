/**
 * Book Model
 * Represents a book project containing all entities
 */
import { toModelDate } from './dateValue'

export class Book {
  constructor({
    id = null,
    userId = null, // owner of the project
    title = '',
    author = '',
    series = null, // series name if applicable
    seriesOrder = null, // book number in series
    isbn = null,
    genre = '',
    status = 'in-progress', // 'in-progress', 'completed', 'planning'
    description = '',
    chapters = 0,
    cover = null,
    coverImageUrl = null,
    readStartDate = null,
    readEndDate = null,
    visibility = 'private', // 'private', 'shared', 'public'
    collaboratorIds = [],
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id
    this.userId = userId
    this.title = title
    this.author = author
    this.series = series
    this.seriesOrder = seriesOrder
    this.isbn = isbn
    this.genre = genre
    this.status = status
    this.description = description
    this.chapters = chapters
    this.cover = cover ?? coverImageUrl ?? null
    this.coverImageUrl = coverImageUrl ?? cover ?? null
    this.readStartDate = readStartDate
    this.readEndDate = readEndDate
    this.visibility = visibility
    this.collaboratorIds = collaboratorIds
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(doc) {
    const data = doc.data()
    return new Book({
      id: doc.id,
      ...data,
      cover: data.cover ?? data.coverImageUrl ?? null,
      coverImageUrl: data.coverImageUrl ?? data.cover ?? null,
      readStartDate: toModelDate(data.readStartDate, null),
      readEndDate: toModelDate(data.readEndDate, null),
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
