/**
 * Book Model
 * Represents a book project containing all entities
 */
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
    this.coverImageUrl = coverImageUrl
    this.readStartDate = readStartDate
    this.readEndDate = readEndDate
    this.visibility = visibility
    this.collaboratorIds = collaboratorIds
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(doc) {
    return new Book({
      id: doc.id,
      ...doc.data(),
      readStartDate: doc.data().readStartDate?.toDate() || null,
      readEndDate: doc.data().readEndDate?.toDate() || null,
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
