/**
 * Book Workspace Store
 * Pinia store for managing a single book's entities and data
 */

import { defineStore, acceptHMRUpdate } from 'pinia'
import { DataRepository } from '../models/DataRepository.js'
import { TimelineData } from '../models/TimelineData.js'
import { GenealogyData } from '../models/GenealogyData.js'
import { OrgChartData } from '../models/OrgChartData.js'

export const useBookWorkspaceStore = defineStore('bookWorkspace', {
  state: () => ({
    currentBookId: null,
    repository: new DataRepository(),
    timelineData: null,
    genealogyData: null,
    orgChartData: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    currentBook: (state) => {
      if (state.currentBookId) {
        return state.repository.getBook(state.currentBookId)
      }
      return null
    },

    characters: (state) => state.repository.getCharactersByBook(state.currentBookId),
    events: (state) => state.repository.getEventsByBook(state.currentBookId),
    settings: (state) => state.repository.getSettingsByBook(state.currentBookId),
    relationships: (state) => state.repository.getRelationshipsByBook(state.currentBookId),

    characterCount: (state) => {
      if (state.currentBookId) {
        return state.repository.getCharactersByBook(state.currentBookId).length
      }
      return 0
    },

    eventCount: (state) => {
      if (state.currentBookId) {
        return state.repository.getEventsByBook(state.currentBookId).length
      }
      return 0
    },

    settingCount: (state) => {
      if (state.currentBookId) {
        return state.repository.getSettingsByBook(state.currentBookId).length
      }
      return 0
    },

    relationshipCount: (state) => {
      if (state.currentBookId) {
        return state.repository.getRelationshipsByBook(state.currentBookId).length
      }
      return 0
    },

    stats: (state) => state.repository.getStats(),
  },

  actions: {
    /**
     * Initialize a book workspace
     */
    async initializeBook(bookId, entities = {}) {
      this.currentBookId = bookId
      this.isLoading = true
      this.error = null

      try {
        // Add all entities to repository
        if (entities.characters?.length) {
          this.repository.addMany('characters', entities.characters)
        }
        if (entities.events?.length) {
          this.repository.addMany('events', entities.events)
        }
        if (entities.settings?.length) {
          this.repository.addMany('settings', entities.settings)
        }
        if (entities.relationships?.length) {
          this.repository.addMany('relationships', entities.relationships)
        }
        if (entities.book) {
          this.repository.addBook(entities.book)
        }

        // Initialize visualization data structures
        this.initializeTimelineData()
        this.initializeGenealogyData()
        this.initializeOrgChartData()

        this.isLoading = false
      } catch (err) {
        this.error = err.message
        this.isLoading = false
      }
    },

    /**
     * Load a book and its data (stub for Firebase integration)
     */
    async loadBook(bookId) {
      this.isLoading = true
      this.error = null

      try {
        // TODO: Fetch book and entities from Firebase
        this.currentBookId = bookId
        this.isLoading = false
      } catch (err) {
        this.error = err.message
        this.isLoading = false
      }
    },

    /**
     * Character management
     */

    addCharacter(character) {
      if (!character.bookId) {
        character.bookId = this.currentBookId
      }
      this.repository.addCharacter(character)
    },

    updateCharacter(character) {
      character.updatedAt = new Date()
      this.repository.updateCharacter(character)
    },

    deleteCharacter(characterId) {
      // Also delete related relationships
      const rels = this.repository.getRelationshipsForEntity(characterId, 'character')
      rels.forEach((rel) => this.repository.deleteRelationship(rel.id))
      this.repository.deleteCharacter(characterId)
    },

    /**
     * Event management
     */

    addEvent(event) {
      if (!event.bookId) {
        event.bookId = this.currentBookId
      }
      this.repository.addEvent(event)
    },

    updateEvent(event) {
      event.updatedAt = new Date()
      this.repository.updateEvent(event)
    },

    deleteEvent(eventId) {
      // Also delete related relationships
      const rels = this.repository.getRelationshipsForEntity(eventId, 'event')
      rels.forEach((rel) => this.repository.deleteRelationship(rel.id))
      this.repository.deleteEvent(eventId)
    },

    /**
     * Setting management
     */

    addSetting(setting) {
      if (!setting.bookId) {
        setting.bookId = this.currentBookId
      }
      this.repository.addSetting(setting)
    },

    updateSetting(setting) {
      setting.updatedAt = new Date()
      this.repository.updateSetting(setting)
    },

    deleteSetting(settingId) {
      // Also delete related relationships
      const rels = this.repository.getRelationshipsForEntity(settingId, 'setting')
      rels.forEach((rel) => this.repository.deleteRelationship(rel.id))
      this.repository.deleteSetting(settingId)
    },

    /**
     * Relationship management
     */

    addRelationship(relationship) {
      if (!relationship.bookId) {
        relationship.bookId = this.currentBookId
      }
      this.repository.addRelationship(relationship)

      // Update visualization data if needed
      if (relationship.sourceType === 'character' && relationship.targetType === 'character') {
        if (GenealogyData.FAMILY_RELATIONSHIPS.includes(relationship.relationshipType)) {
          // Regenerate genealogy data
          this.initializeGenealogyData()
        }
        if (OrgChartData.HIERARCHY_RELATIONSHIPS.includes(relationship.relationshipType)) {
          // Regenerate org chart data
          this.initializeOrgChartData()
        }
      }
    },

    updateRelationship(relationship) {
      relationship.updatedAt = new Date()
      this.repository.updateRelationship(relationship)
    },

    deleteRelationship(relationshipId) {
      this.repository.deleteRelationship(relationshipId)
    },

    /**
     * Timeline visualization
     */

    initializeTimelineData() {
      const events = this.repository.getEventsByBook(this.currentBookId)
      this.timelineData = new TimelineData({
        bookId: this.currentBookId,
        events: events.sort((a, b) => a.getTimelineKey() - b.getTimelineKey()),
      })
    },

    setTimelineFilter(category, values) {
      if (this.timelineData) {
        this.timelineData.setFilter(category, values)
      }
    },

    clearTimelineFilters() {
      if (this.timelineData) {
        this.timelineData.clearFilters()
      }
    },

    getTimelineFilterOptions(category) {
      if (this.timelineData) {
        return this.timelineData.getFilterOptions(category)
      }
      return []
    },

    /**
     * Genealogy visualization
     */

    initializeGenealogyData() {
      const rels = this.repository.getRelationshipsByBook(this.currentBookId)
      const familyRels = rels.filter((rel) =>
        GenealogyData.FAMILY_RELATIONSHIPS.includes(rel.relationshipType),
      )

      this.genealogyData = new GenealogyData({
        bookId: this.currentBookId,
        relationships: familyRels,
      })
    },

    getFamilyTree(rootCharacterId) {
      if (this.genealogyData) {
        const rels = this.repository.getRelationshipsByBook(this.currentBookId)
        return this.genealogyData.buildFamilyTree(rootCharacterId, rels)
      }
      return null
    },

    getCommonAncestorsFor(char1Id, char2Id) {
      if (this.genealogyData) {
        const rels = this.repository.getRelationshipsByBook(this.currentBookId)
        return this.genealogyData.getCommonAncestors(char1Id, char2Id, rels)
      }
      return []
    },

    /**
     * Organization chart visualization
     */

    initializeOrgChartData() {
      const rels = this.repository.getRelationshipsByBook(this.currentBookId)
      const hierarchyRels = rels.filter((rel) =>
        OrgChartData.HIERARCHY_RELATIONSHIPS.includes(rel.relationshipType),
      )

      this.orgChartData = new OrgChartData({
        bookId: this.currentBookId,
        relationships: hierarchyRels,
      })
    },

    getOrgChart(rootCharacterId, orgName = null) {
      if (this.orgChartData) {
        const rels = this.repository.getRelationshipsByBook(this.currentBookId)
        return this.orgChartData.buildOrgTree(rootCharacterId, rels, orgName)
      }
      return null
    },

    getReportingChain(characterId) {
      if (this.orgChartData) {
        const rels = this.repository.getRelationshipsByBook(this.currentBookId)
        return this.orgChartData.getReportingChain(characterId, rels)
      }
      return []
    },

    /**
     * Utility
     */

    reset() {
      this.currentBookId = null
      this.repository.clearCache()
      this.timelineData = null
      this.genealogyData = null
      this.orgChartData = null
      this.error = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBookWorkspaceStore, import.meta.hot))
}
