/**
 * Book Library Store
 * Pinia store for managing user's book collection
 */

import { defineStore, acceptHMRUpdate } from 'pinia'
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from 'boot/firebaseInit'
import { Book } from 'src/models'

function normalizeBook(book) {
  if (!book) {
    return null
  }

  return book instanceof Book ? book : new Book(book)
}

export const useBookLibraryStore = defineStore('bookLibrary', {
  state: () => ({
    currentUserId: null,
    books: new Map(),
    isLoading: false,
    error: null,
  }),

  getters: {
    userBooks: (state) => {
      if (state.currentUserId) {
        return Array.from(state.books.values()).filter(
          (book) => book.userId === state.currentUserId,
        )
      }
      return []
    },

    bookCount: (state) => state.books.size,

    booksByVisibility: (state) => (visibility) => {
      if (state.currentUserId) {
        return Array.from(state.books.values()).filter(
          (book) => book.userId === state.currentUserId && book.visibility === visibility,
        )
      }
      return []
    },

    booksBySeries: (state) => (seriesName) => {
      if (state.currentUserId) {
        return Array.from(state.books.values())
          .filter((book) => book.userId === state.currentUserId && book.series === seriesName)
          .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
      }
      return []
    },

    recentBooks: (state) => (limit) => {
      if (state.currentUserId) {
        return Array.from(state.books.values())
          .filter((book) => book.userId === state.currentUserId)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit)
      }
      return []
    },
  },

  actions: {
    /**
     * Initialize library for user
     */
    async initializeLibrary(userId, initialBooks = []) {
      this.currentUserId = userId
      this.isLoading = true
      this.error = null

      try {
        this.books.clear()
        initialBooks.forEach((book) => {
          const normalizedBook = normalizeBook({ ...book, userId })
          if (normalizedBook?.id) {
            this.books.set(normalizedBook.id, normalizedBook)
          }
        })
        this.isLoading = false
      } catch (err) {
        this.error = err.message
        this.isLoading = false
      }
    },

    /**
     * Load user's books from Firebase
     */
    async loadUserBooks(seedBooks = []) {
      this.isLoading = true
      this.error = null

      try {
        if (!this.currentUserId) {
          throw new Error('No authenticated user found')
        }

        this.books.clear()

        const booksQuery = query(collection(db, 'books'), where('userId', '==', this.currentUserId))
        const snapshot = await getDocs(booksQuery)

        if (snapshot.empty && seedBooks.length) {
          const seededBooks = seedBooks
            .map((book) => normalizeBook({ ...book, userId: this.currentUserId }))
            .filter(Boolean)

          await Promise.all(
            seededBooks.map((book) => setDoc(doc(db, 'books', book.id), book.toFirestore())),
          )

          seededBooks.forEach((book) => {
            this.books.set(book.id, book)
          })
        } else {
          snapshot.forEach((bookDoc) => {
            this.books.set(bookDoc.id, Book.fromFirestore(bookDoc))
          })
        }

        this.isLoading = false
        return Array.from(this.books.values())
      } catch (err) {
        console.error('Failed to load user books from Firestore:', err)
        this.error = err.message
        this.isLoading = false
        return []
      }
    },

    /**
     * Add a new book to library
     */
    async addBook(book) {
      if (!book.userId) {
        book.userId = this.currentUserId
      }

      const normalizedBook = normalizeBook({
        ...book,
        userId: book.userId,
        createdAt: book.createdAt || new Date(),
        updatedAt: new Date(),
      })

      if (!normalizedBook?.id) {
        throw new Error('Book id is required')
      }

      await setDoc(doc(db, 'books', normalizedBook.id), normalizedBook.toFirestore())
      this.books.set(normalizedBook.id, normalizedBook)
      return normalizedBook
    },

    /**
     * Get a single book
     */
    getBook(bookId) {
      return this.books.get(bookId)
    },

    /**
     * Update a book
     */
    async updateBook(book) {
      const normalizedBook = normalizeBook(book)
      if (!normalizedBook?.id) {
        throw new Error('Book id is required')
      }

      normalizedBook.updatedAt = new Date()

      // Preserve userId: if the incoming book is missing userId, keep the existing owner's id
      const existing = this.books.get(normalizedBook.id)
      if (existing && !normalizedBook.userId) {
        normalizedBook.userId = existing.userId
      } else if (!normalizedBook.userId && this.currentUserId) {
        // Fallback to current authenticated user if available
        normalizedBook.userId = this.currentUserId
      }

      await setDoc(doc(db, 'books', normalizedBook.id), normalizedBook.toFirestore())
      this.books.set(normalizedBook.id, normalizedBook)
      return normalizedBook
    },

    /**
     * Delete a book
     */
    async deleteBook(bookId) {
      await deleteDoc(doc(db, 'books', bookId))
      this.books.delete(bookId)
    },

    /**
     * Update book visibility/sharing
     */
    async updateBookVisibility(bookId, visibility, collaboratorIds = []) {
      const book = this.books.get(bookId)
      if (book) {
        book.visibility = visibility
        book.collaboratorIds = collaboratorIds
        book.updatedAt = new Date()
        await this.updateBook(book)
      }
    },

    /**
     * Add collaborators to a book
     */
    async addCollaborators(bookId, userIds) {
      const book = this.books.get(bookId)
      if (book) {
        const uniqueIds = new Set([...book.collaboratorIds, ...userIds])
        book.collaboratorIds = Array.from(uniqueIds)
        book.updatedAt = new Date()
        await this.updateBook(book)
      }
    },

    /**
     * Remove collaborators from a book
     */
    async removeCollaborators(bookId, userIds) {
      const book = this.books.get(bookId)
      if (book) {
        book.collaboratorIds = book.collaboratorIds.filter((id) => !userIds.includes(id))
        book.updatedAt = new Date()
        await this.updateBook(book)
      }
    },

    /**
     * Search books by title or author
     */
    searchBooks(query) {
      const lowerQuery = query.toLowerCase()
      return Array.from(this.books.values()).filter(
        (book) =>
          book.userId === this.currentUserId &&
          (book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery)),
      )
    },

    /**
     * Get series information
     */
    getAllSeries() {
      const series = new Map()

      Array.from(this.books.values())
        .filter((book) => book.userId === this.currentUserId && book.series)
        .forEach((book) => {
          if (!series.has(book.series)) {
            series.set(book.series, [])
          }
          series.get(book.series).push(book)
        })

      // Sort by series order
      series.forEach((books) => {
        books.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
      })

      return series
    },

    /**
     * Get statistics
     */
    getStats() {
      const books = Array.from(this.books.values()).filter(
        (book) => book.userId === this.currentUserId,
      )

      return {
        total: books.length,
        inProgress: books.filter((b) => b.status === 'in-progress').length,
        completed: books.filter((b) => b.status === 'completed').length,
        planning: books.filter((b) => b.status === 'planning').length,
        inSeries: books.filter((b) => b.series).length,
        standalone: books.filter((b) => !b.series).length,
      }
    },

    /**
     * Reset store
     */
    reset() {
      this.currentUserId = null
      this.books.clear()
      this.error = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBookLibraryStore, import.meta.hot))
}
