/\*\*

- Data Schema Documentation
-
- This document outlines the data structure for Tapestry
- All entities are designed to be stored in Firebase Firestore
  \*/

/\*\*

- FIRESTORE COLLECTION STRUCTURE
-
- /users/{userId}
- └── userProfile (document)
-       - email
-       - displayName
-       - avatar
-       - createdAt
-       - updatedAt
-
- /books/{bookId}
- ├── (metadata)
- ├── characters/{characterId}
- ├── events/{eventId}
- ├── settings/{settingId}
- └── relationships/{relationshipId}
  \*/

/\*\*

- BOOK ENTITY
-
- Path: /books/{bookId}
-
- {
- id: string (auto-generated)
- userId: string (owner)
- title: string
- author: string
- series: string | null
- seriesOrder: number | null
- isbn: string | null
- genre: string
- status: 'in-progress' | 'completed' | 'planning'
- description: string
- chapters: number
- coverImageUrl: string | null
- readStartDate: Date | null
- readEndDate: Date | null
- visibility: 'private' | 'shared' | 'public'
- collaboratorIds: string[] (user IDs with access)
- tags: string[]
- createdAt: Date
- updatedAt: Date
- }
  \*/

/\*\*

- CHARACTER ENTITY
-
- Path: /books/{bookId}/characters/{characterId}
-
- {
- id: string (auto-generated)
- bookId: string (parent book)
- name: string
- aliases: string[]
- status: 'active' | 'deceased' | 'unknown' | 'retired'
- role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'love-interest' | ...
- description: string (short description)
- firstAppearance: string | null (reference to event id)
- background: string (longer background info)
- imageUrl: string | null
- tags: string[]
- createdAt: Date
- updatedAt: Date
- }
  \*/

/\*\*

- EVENT ENTITY
-
- Path: /books/{bookId}/events/{eventId}
-
- {
- id: string (auto-generated)
- bookId: string (parent book)
- title: string
- description: string
- chapter: number | null
- chapterTitle: string
- pageStart: number | null
- pageEnd: number | null
- sequenceOrder: number (for sorting timeline)
- internalDate: Date | null (story-world date)
- characterIds: string[] (participating characters)
- settingIds: string[] (involved locations)
- arc: string (e.g., 'major-plot', 'romance', 'mystery')
- emotionalTone: 'happy' | 'tragic' | 'tense' | 'turning-point' | ...
- tags: string[]
- notes: string
- createdAt: Date
- updatedAt: Date
- }
  \*/

/\*\*

- SETTING ENTITY
-
- Path: /books/{bookId}/settings/{settingId}
-
- {
- id: string (auto-generated)
- bookId: string (parent book)
- name: string
- aliases: string[]
- type: string ('kingdom', 'city', 'building', 'region', 'planet', etc.)
- description: string
- geography: string
- climate: string
- population: number | null
- ruler: string (name of ruler/governor)
- firstAppearance: string | null (reference to event id)
- relatedCharacterIds: string[] (characters associated with setting)
- parentSettingId: string | null (for nested locations)
- imageUrl: string | null
- tags: string[]
- createdAt: Date
- updatedAt: Date
- }
  \*/

/\*\*

- RELATIONSHIP ENTITY
-
- Path: /books/{bookId}/relationships/{relationshipId}
-
- {
- id: string (auto-generated)
- bookId: string (parent book)
- sourceId: string (character, event, or setting id)
- sourceType: 'character' | 'event' | 'setting'
- targetId: string (character, event, or setting id)
- targetType: 'character' | 'event' | 'setting'
- relationshipType: string
-     - FAMILY: 'parent', 'child', 'sibling', 'spouse', 'grandparent', 'grandchild', 'aunt-uncle', 'cousin'
-     - HIERARCHY: 'supervises', 'reports-to', 'leads', 'member-of', 'head-of', 'founder'
-     - CHARACTER: 'enemy', 'ally', 'love-interest', 'mentor', 'mentee', 'friend', 'rival'
-     - EVENT: 'participated-in', 'witnessed', 'caused', 'affected-by'
-     - LOCATION: 'resident-of', 'visited', 'rules', 'founded'
- description: string (additional context)
- strength: 'weak' | 'medium' | 'strong' (visualization weight)
- bidirectional: boolean (whether relationship is symmetric)
- tags: string[]
- createdAt: Date
- updatedAt: Date
- }
  \*/

/\*\*

- RELATIONSHIP TYPE CATEGORIES
-
- FAMILY RELATIONSHIPS (for GenealogyData visualization):
- - parent / child
- - sibling
- - spouse
- - grandparent / grandchild
- - aunt-uncle / niece-nephew
- - cousin
-
- HIERARCHY RELATIONSHIPS (for OrgChartData visualization):
- - supervises / reports-to
- - leads
- - member-of
- - head-of
- - founder
-
- CHARACTER RELATIONSHIPS (for general graph):
- - enemy / ally
- - love-interest
- - mentor / mentee
- - friend / rival
- - acquaintance
-
- EVENT RELATIONSHIPS:
- - participated-in
- - witnessed
- - caused
- - affected-by
-
- LOCATION RELATIONSHIPS:
- - resident-of
- - visited
- - rules
- - founded
    \*/

/\*\*

- FIRESTORE SECURITY RULES OUTLINE
-
- - Users can only access their own books
- - Books marked 'shared' can be accessed by collaborators
- - Books marked 'public' can be read by anyone
- - Only the book owner can modify book settings
- - Collaborators with 'editor' role can modify entities within shared books
    \*/

/\*\*

- VISUALIZATION DATA STRUCTURES (In-Memory)
-
- TimelineData
- - Chronologically sorted events
- - Filter system (by character, setting, arc, tone, tags)
- - Grouping options (by chapter, arc, date, tone)
-
- GenealogyData
- - Family relationship subset
- - Family tree building functionality
- - Common ancestor detection
- - Relationship degree calculation
-
- OrgChartData
- - Hierarchy relationship subset
- - Org tree building functionality
- - Reporting chain traversal
- - Direct report listing
- - Hierarchy level calculation
    \*/

export const DATA_SCHEMA_DOCS = {
created: '2026-05-03',
version: '1.0',
notes: 'See document above for full schema details',
};
