/**
 * Book Library Store
 * Pinia store for managing user's book collection
 */

import { defineStore, acceptHMRUpdate } from 'pinia'

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
          this.books.set(book.id, book)
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
    async loadUserBooks() {
      this.isLoading = true
      this.error = null

      try {
        // TODO: Fetch books from Firebase for currentUserId
        this.isLoading = false
      } catch (err) {
        this.error = err.message
        this.isLoading = false
      }
    },

    /**
     * Add a new book to library
     */
    addBook(book) {
      if (!book.userId) {
        book.userId = this.currentUserId
      }
      this.books.set(book.id, book)
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
    updateBook(book) {
      book.updatedAt = new Date()
      this.books.set(book.id, book)
    },

    /**
     * Delete a book
     */
    deleteBook(bookId) {
      this.books.delete(bookId)
    },

    /**
     * Update book visibility/sharing
     */
    updateBookVisibility(bookId, visibility, collaboratorIds = []) {
      const book = this.books.get(bookId)
      if (book) {
        book.visibility = visibility
        book.collaboratorIds = collaboratorIds
        book.updatedAt = new Date()
      }
    },

    /**
     * Add collaborators to a book
     */
    addCollaborators(bookId, userIds) {
      const book = this.books.get(bookId)
      if (book) {
        const uniqueIds = new Set([...book.collaboratorIds, ...userIds])
        book.collaboratorIds = Array.from(uniqueIds)
        book.updatedAt = new Date()
      }
    },

    /**
     * Remove collaborators from a book
     */
    removeCollaborators(bookId, userIds) {
      const book = this.books.get(bookId)
      if (book) {
        book.collaboratorIds = book.collaboratorIds.filter((id) => !userIds.includes(id))
        book.updatedAt = new Date()
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
