/**
 * TimelineData Model
 * Specialized data structure for timeline visualization
 * Organizes events chronologically with filtering and grouping capabilities
 */
export class TimelineData {
  constructor({
    bookId = null,
    events = [], // sorted Event objects
    filters = {
      characters: [], // character ids to filter by
      settings: [], // setting ids to filter by
      arcs: [], // story arcs to filter by
      emotionalTones: [], // emotional tones to filter by
      tags: [],
    },
    groupBy = 'chapter', // 'chapter', 'arc', 'date', 'emotionalTone'
  } = {}) {
    this.bookId = bookId
    this.events = events
    this.filters = filters
    this.groupBy = groupBy
  }

  /**
   * Get filtered events based on current filters
   */
  getFilteredEvents() {
    return this.events.filter((event) => {
      if (
        this.filters.characters.length > 0 &&
        !event.characterIds.some((id) => this.filters.characters.includes(id))
      ) {
        return false
      }

      if (
        this.filters.settings.length > 0 &&
        !event.settingIds.some((id) => this.filters.settings.includes(id))
      ) {
        return false
      }

      if (this.filters.arcs.length > 0 && !this.filters.arcs.includes(event.arc)) {
        return false
      }

      if (
        this.filters.emotionalTones.length > 0 &&
        !this.filters.emotionalTones.includes(event.emotionalTone)
      ) {
        return false
      }

      if (
        this.filters.tags.length > 0 &&
        !event.tags.some((tag) => this.filters.tags.includes(tag))
      ) {
        return false
      }

      return true
    })
  }

  /**
   * Group events by specified criteria
   */
  getGroupedEvents() {
    const filtered = this.getFilteredEvents()
    const groups = {}

    filtered.forEach((event) => {
      let groupKey

      switch (this.groupBy) {
        case 'arc':
          groupKey = event.arc || 'untagged'
          break
        case 'date':
          groupKey = event.internalDate || 'undated'
          break
        case 'emotionalTone':
          groupKey = event.emotionalTone || 'neutral'
          break
        case 'chapter':
        default:
          groupKey = event.chapter || 0
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(event)
    })

    return groups
  }

  /**
   * Set filter for a specific category
   */
  setFilter(category, values) {
    if (Object.prototype.hasOwnProperty.call(this.filters, category)) {
      this.filters[category] = values
    }
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.filters = {
      characters: [],
      settings: [],
      arcs: [],
      emotionalTones: [],
      tags: [],
    }
  }

  /**
   * Get all unique values for a filter category
   */
  getFilterOptions(category) {
    switch (category) {
      case 'characters':
        return [...new Set(this.events.flatMap((e) => e.characterIds))]
      case 'settings':
        return [...new Set(this.events.flatMap((e) => e.settingIds))]
      case 'arcs':
        return [...new Set(this.events.map((e) => e.arc).filter(Boolean))]
      case 'emotionalTones':
        return [...new Set(this.events.map((e) => e.emotionalTone).filter(Boolean))]
      case 'tags':
        return [...new Set(this.events.flatMap((e) => e.tags))]
      default:
        return []
    }
  }
}
