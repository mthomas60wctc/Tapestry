# Tapestry Data Layer

## Overview

The data layer is built around core entities that represent story elements: **Characters**, **Events**, **Settings**, and **Relationships**. Additionally, we have **Books** as project containers and specialized visualization data structures: **TimelineData**, **GenealogyData**, and **OrgChartData**.

## Core Entities

### Character

Represents an individual in the story.

**Key Fields:**

- `name`, `aliases` - Character identification
- `status` - active, deceased, unknown, retired
- `role` - protagonist, antagonist, supporting, etc.
- `description`, `background` - Textual info
- `firstAppearance` - Reference to an Event
- `tags` - Categorization and filtering

```javascript
import { ModelFactory } from './models'

const character = ModelFactory.createCharacter({
  bookId: 'book-123',
  name: 'Jon Snow',
  aliases: ['The Bastard of Winterfell'],
  role: 'protagonist',
  description: 'Ward of Winterfell',
  tags: ['Stark', "Night's Watch"],
})
```

### Event

Represents a scene, chapter moment, or story event.

**Key Fields:**

- `title`, `description` - Event content
- `chapter`, `pageStart`, `pageEnd` - Story location
- `sequenceOrder` - For timeline ordering
- `internalDate` - Story-world date
- `characterIds`, `settingIds` - Participants and locations
- `arc` - Story arc identifier
- `emotionalTone` - narrative tone

```javascript
const event = ModelFactory.createEvent({
  bookId: 'book-123',
  title: 'The Stark Execution',
  chapter: 5,
  sequenceOrder: 5,
  characterIds: ['char-jon', 'char-ned'],
  settingIds: ['setting-winterfell'],
  arc: 'house-politics',
  emotionalTone: 'tragic',
})
```

### Setting

Represents a location, place, or environment.

**Key Fields:**

- `name`, `aliases` - Location identification
- `type` - kingdom, city, building, region, etc.
- `geography`, `climate` - Environmental details
- `ruler` - Who governs
- `parentSettingId` - For nested locations (city within kingdom)
- `relatedCharacterIds` - Characters associated with location

```javascript
const setting = ModelFactory.createSetting({
  bookId: 'book-123',
  name: 'Winterfell',
  type: 'castle',
  description: 'Seat of House Stark',
  ruler: 'House Stark',
  parentSettingId: 'setting-north',
})
```

### Book

Represents a project containing all entities.

**Key Fields:**

- `userId` - Owner of project
- `title`, `author` - Book information
- `series`, `seriesOrder` - Series information
- `status` - in-progress, completed, planning
- `visibility` - private, shared, public
- `collaboratorIds` - Team members

```javascript
const book = ModelFactory.createBook({
  userId: 'user-456',
  title: 'A Game of Thrones',
  author: 'George R.R. Martin',
  series: 'A Song of Ice and Fire',
  seriesOrder: 1,
  status: 'completed',
})
```

### Relationship

Represents connections between entities (characters, events, settings).

**Key Fields:**

- `sourceId`, `sourceType` - Starting entity
- `targetId`, `targetType` - Connected entity
- `relationshipType` - Family, hierarchy, character, event, location types
- `strength` - weak, medium, strong (for visualization)
- `bidirectional` - Symmetric relationships

**Relationship Types:**

**Family (GenealogyData):**

- parent / child
- sibling
- spouse
- grandparent, aunt-uncle, cousin

**Hierarchy (OrgChartData):**

- supervises / reports-to
- leads
- member-of
- head-of
- founder

**Character Relationships:**

- enemy / ally
- love-interest
- mentor / mentee
- friend / rival

**Event Relationships:**

- participated-in
- witnessed
- caused
- affected-by

**Location Relationships:**

- resident-of
- visited
- rules
- founded

```javascript
const familyRel = ModelFactory.createFamilyRelationship(
  'char-ned',
  'char-jon',
  'parent',
  'book-123',
)

const hierRel = ModelFactory.createHierarchyRelationship(
  'char-commander',
  'char-soldier',
  'supervises',
  'book-123',
)
```

## Visualization Data Structures

### TimelineData

Organizes events chronologically with filtering and grouping.

**Features:**

- Chronological sorting
- Multi-dimensional filtering (characters, settings, arcs, tones, tags)
- Grouping options (by chapter, arc, date, emotional tone)

```javascript
const timeline = store.timelineData

// Set filters
timeline.setFilter('characters', ['char-jon', 'char-ned'])
timeline.setFilter('arcs', ['house-politics'])

// Get filtered events
const filtered = timeline.getFilteredEvents()

// Get grouped events
timeline.groupBy = 'arc'
const grouped = timeline.getGroupedEvents()

// Get filter options
const characters = timeline.getFilterOptions('characters')
```

### GenealogyData

Represents family trees and genealogical relationships.

**Features:**

- Build family trees from any character
- Find common ancestors
- Calculate relationship degrees
- Family relationship filtering

```javascript
const genealogy = store.genealogyData

// Build a family tree starting from a character
const tree = genealogy.buildFamilyTree('char-ned', relationships)
// Returns: { characterId, parents, children, siblings, spouse, depth... }

// Find common ancestors
const ancestors = genealogy.getCommonAncestors('char-jon', 'char-arya', relationships)

// Calculate relationship degree
const degree = genealogy.getRelationshipDegree('char-jon', 'char-sansa', relationships)
```

### OrgChartData

Represents organizational hierarchies and command structures.

**Features:**

- Build org trees from any leader
- Get reporting chains (chain of command)
- Get direct reports (subordinates)
- Organization membership tracking
- Hierarchy level calculation

```javascript
const orgChart = store.orgChartData

// Build org tree
const tree = orgChart.buildOrgTree('char-commander', relationships)

// Get reporting chain
const chain = orgChart.getReportingChain('char-soldier', relationships)

// Get direct reports
const reports = orgChart.getDirectReports('char-commander', relationships)

// Get org members
const members = orgChart.getOrganizationMembers("Night's Watch", relationships)
```

## Data Repository

A centralized in-memory cache for entities during a session.

```javascript
const repository = new DataRepository()

// Character operations
repository.addCharacter(character)
const char = repository.getCharacter('char-123')
const bookChars = repository.getCharactersByBook('book-123')
repository.updateCharacter(character)
repository.deleteCharacter('char-123')

// Same operations available for:
// - addEvent, getEvent, getEventsByBook, updateEvent, deleteEvent
// - addSetting, getSetting, getSettingsByBook, updateSetting, deleteSetting
// - addRelationship, getRelationship, etc.

// Query relationships for an entity
const rels = repository.getRelationshipsForEntity('char-123', 'character')

// Statistics
const stats = repository.getStats()
// { characterCount, eventCount, settingCount, relationshipCount, bookCount }
```

## Pinia Stores

### useBookWorkspaceStore

Manages a single book's data while working.

```javascript
import { useBookWorkspaceStore } from './stores/bookWorkspace'

const bookStore = useBookWorkspaceStore()

// Initialize with data
bookStore.initializeBook('book-123', {
  characters: [char1, char2],
  events: [event1, event2],
  settings: [setting1, setting2],
  relationships: [rel1, rel2],
  book: bookData,
})

// Access entities
bookStore.characters // Getter: filtered by current book
bookStore.events // Getter: filtered by current book
bookStore.relationships

// CRUD operations
bookStore.addCharacter(character)
bookStore.updateCharacter(character)
bookStore.deleteCharacter('char-123')

// Visualization access
bookStore.timelineData // TimelineData instance
bookStore.genealogyData // GenealogyData instance
bookStore.orgChartData // OrgChartData instance

// Timeline operations
bookStore.setTimelineFilter('characters', ['char-123'])
bookStore.getTimelineFilterOptions('arcs')

// Genealogy operations
const familyTree = bookStore.getFamilyTree('char-123')
const ancestors = bookStore.getCommonAncestorsFor('char-1', 'char-2')

// Org chart operations
const orgTree = bookStore.getOrgChart('char-leader')
const reportingChain = bookStore.getReportingChain('char-123')
```

### useBookLibraryStore

Manages user's library of books.

```javascript
import { useBookLibraryStore } from './stores/bookLibrary'

const libraryStore = useBookLibraryStore()

// Initialize for user
libraryStore.initializeLibrary('user-456', [book1, book2])

// Access books
libraryStore.userBooks // Getter: filtered by current user
libraryStore.bookCount // Getter: total book count
libraryStore.recentBooks(5) // Getter: last 5 modified books

// CRUD operations
libraryStore.addBook(book)
libraryStore.updateBook(book)
libraryStore.deleteBook('book-123')

// Search and filter
libraryStore.searchBooks('Game of Thrones')
libraryStore.booksByVisibility('private')
libraryStore.booksBySeries('A Song of Ice and Fire')

// Sharing
libraryStore.updateBookVisibility('book-123', 'shared', ['user-789'])
libraryStore.addCollaborators('book-123', ['user-789', 'user-321'])
libraryStore.removeCollaborators('book-123', ['user-789'])

// Statistics
const stats = libraryStore.getStats()
// { total, inProgress, completed, planning, inSeries, standalone }
```

## Data Utilities

Helper functions for complex queries and operations.

```javascript
import * as DataUtilities from './models/DataUtilities'

// Get related entities
const related = DataUtilities.getRelatedEntities('char-123', relationships, repository)
// { characters: [...], events: [...], settings: [...] }

// Get relationships with populated data
const enrichedRels = DataUtilities.getRelationshipsWithData('char-123', relationships, repository)

// Find path between characters
const path = DataUtilities.findCharacterPath('char-1', 'char-2', relationships)
// [char-1, char-3, char-5, char-2]

// Get character communities (connected groups)
const communities = DataUtilities.getCharacterCommunities(relationships)
// [[char-1, char-2, char-3], [char-4, char-5]]

// Get network statistics
const stats = DataUtilities.getCharacterNetworkStats(relationships)
// { totalCharacters, totalRelationships, averageConnections, hubCharacters, relationshipTypes }

// Global search across all entities
const results = DataUtilities.globalSearch('Jon Snow', repository)
// { characters: [...], events: [...], settings: [...] }
```

## Usage Example: Building a Complete Book Session

```javascript
import { ModelFactory, Book, Character, Event, Setting, Relationship } from '@/models'
import { useBookWorkspaceStore } from '@/stores/bookWorkspace'

// Create entities
const book = ModelFactory.createBook({
  userId: 'user-456',
  title: 'A Game of Thrones',
  author: 'George R.R. Martin',
  series: 'A Song of Ice and Fire',
  seriesOrder: 1,
})

const ned = ModelFactory.createCharacter({
  name: 'Eddard Stark',
  role: 'protagonist',
  status: 'deceased',
})

const jon = ModelFactory.createCharacter({
  name: 'Jon Snow',
  role: 'protagonist',
})

const winterfell = ModelFactory.createSetting({
  name: 'Winterfell',
  type: 'castle',
  ruler: 'House Stark',
})

const starkExecution = ModelFactory.createEvent({
  title: 'The Stark Execution',
  chapter: 5,
  characterIds: [ned.id, jon.id],
  settingIds: [winterfell.id],
})

// Create relationships
const fatherSonRel = ModelFactory.createFamilyRelationship(ned.id, jon.id, 'parent')

// Initialize store
const bookStore = useBookWorkspaceStore()
bookStore.initializeBook(book.id, {
  book,
  characters: [ned, jon],
  events: [starkExecution],
  settings: [winterfell],
  relationships: [fatherSonRel],
})

// Now use the store
console.log(bookStore.characters) // [ned, jon]
console.log(bookStore.characterCount) // 2

// Build family tree
const nedTree = bookStore.getFamilyTree(ned.id)
console.log(nedTree.children) // [jon, ...]

// Access timeline
const timeline = bookStore.timelineData
console.log(timeline.getFilteredEvents()) // [starkExecution]
```

## Firestore Integration (Future)

The data structure is designed for Firebase Firestore:

```
/books/{bookId}
  ├── (book metadata)
  ├── characters/
  │   ├── {characterId}
  │   └── {characterId}
  ├── events/
  │   ├── {eventId}
  │   └── {eventId}
  ├── settings/
  │   ├── {settingId}
  │   └── {settingId}
  └── relationships/
      ├── {relationshipId}
      └── {relationshipId}
```

Each model has `toFirestore()` and `fromFirestore()` methods for serialization.

## Next Steps

1. ✅ Core data models defined
2. ✅ Visualization data structures implemented
3. ✅ Pinia stores created
4. ⏳ Firebase service integration
5. ⏳ UI components consuming data layer
6. ⏳ Real-time synchronization (Firestore listeners)
