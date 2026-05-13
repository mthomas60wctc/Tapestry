<template>
  <div>
    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-lg-8">
        <q-card bordered flat>
          <q-card-section class="row items-center q-col-gutter-md q-pa-md q-pb-sm">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Threads</div>
            </div>
            <div class="col-auto" style="min-width: 200px">
              <q-input v-model="searchEntityText" outlined dense label="Search" clearable />
            </div>
            <div class="col-auto" style="min-width: 200px">
              <q-select
                v-model="selectedEntityType"
                :options="entityFilterOptions"
                outlined
                dense
                emit-value
                map-options
                label="Filter Threads by Type"
              />
            </div>
            <div class="col-auto">
              <div class="row q-gutter-sm justify-end">
                <q-btn color="primary" icon="person_add" @click="openCharacterModal()" />
                <q-btn color="primary" icon="event" @click="openEventModal()" />
                <q-btn color="primary" icon="place" @click="openLocationModal()" />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <div class="row no-wrap items-stretch workspace-split-pane">
              <div class="col workspace-entity-list-pane">
                <ItemSelectionList
                  :items="filteredEntityEntries"
                  label-key="label"
                  bordered
                  @select="onEntitySelect"
                />
              </div>
              <div class="col workspace-entity-detail-pane">
                <EntityDetailView
                  class="q-pa-sm"
                  :entity="selectedEntity?.entity"
                  :type="selectedEntity?.type"
                  :workspace="workspaceData"
                  @edit="onEntityEdit"
                  @select-entity="onDetailEntitySelect"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <QuickLinksCard
          title="Related Links"
          :items="relatedLinks"
          side-key="side"
          @select="onRelatedLinkSelect"
        />
      </div>
    </div>

    <CharacterModal
      v-model="characterModalOpen"
      :book-id="selectedBookId"
      :entity="characterDraft"
      :workspace="workspaceData"
      :tag-options="tagOptions"
      @save="saveCharacter"
      @delete="deleteCharacter"
    />

    <EventModal
      v-model="eventModalOpen"
      :book-id="selectedBookId"
      :entity="eventDraft"
      :workspace="workspaceData"
      :tag-options="tagOptions"
      @save="saveEvent"
      @delete="deleteEvent"
    />

    <LocationModal
      v-model="locationModalOpen"
      :book-id="selectedBookId"
      :entity="locationDraft"
      :workspace="workspaceData"
      :tag-options="tagOptions"
      @save="saveLocation"
      @delete="deleteLocation"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItemSelectionList from 'src/components/ItemSelectionList.vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import CharacterModal from 'src/components/CharacterModal.vue'
import EventModal from 'src/components/EventModal.vue'
import LocationModal from 'src/components/LocationModal.vue'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'
import {
  createMockLibraryData,
  getMockWorkspaceData,
  saveMockWorkspaceData,
} from 'src/data/mockLibraryData'

const entityFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Characters', value: 'characters' },
  { label: 'Events', value: 'events' },
  { label: 'Settings', value: 'settings' },
]

const bookStore = useBookLibraryStore()
const workspaceStore = useBookWorkspaceStore()
const { books: mockBooks } = createMockLibraryData()

const bookOptions = computed(() => {
  const userBooks = bookStore.userBooks || []
  if (userBooks.length) return userBooks
  return mockBooks
})

const route = useRoute()
const router = useRouter()

const selectedBookId = computed({
  get: () => workspaceStore.currentBookId,
  set: (value) => {
    workspaceStore.currentBookId = value
  },
})
const selectedEntityType = ref('all')
const searchEntityText = ref('')
const selectedEntity = ref(null)
const workspaceData = ref(null)
const characterModalOpen = ref(false)
const eventModalOpen = ref(false)
const locationModalOpen = ref(false)
const characterDraft = ref(null)
const eventDraft = ref(null)
const locationDraft = ref(null)

function cloneWorkspaceData(workspace) {
  if (!workspace) {
    return null
  }

  const cloned = globalThis.structuredClone
    ? globalThis.structuredClone(workspace)
    : JSON.parse(JSON.stringify(workspace))

  // Clean up deprecated fields from entity models (graph refactor)
  // Remove character/event/setting IDs arrays from entities - all connections now go through relationships
  if (cloned.characters) {
    cloned.characters = cloned.characters.map((char) => {
      const cleaned = { ...char }
      delete cleaned.relatedCharacterIds
      delete cleaned.settingIds
      delete cleaned.eventIds
      return cleaned
    })
  }

  if (cloned.events) {
    cloned.events = cloned.events.map((event) => {
      const cleaned = { ...event }
      delete cleaned.characterIds
      delete cleaned.settingIds
      return cleaned
    })
  }

  if (cloned.settings) {
    cloned.settings = cloned.settings.map((setting) => {
      const cleaned = { ...setting }
      delete cleaned.relatedCharacterIds
      delete cleaned.parentSettingId
      return cleaned
    })
  }

  return cloned
}

function cloneEntity(entity) {
  if (!entity) return null
  // Create a plain object copy from the entity, avoiding Proxy issues
  const cleaned = {
    ...entity,
    aliases: entity.aliases ? [...entity.aliases] : [],
    tags: entity.tags ? [...entity.tags] : [],
  }
  // Remove deprecated fields
  delete cleaned.characterIds
  delete cleaned.settingIds
  delete cleaned.relatedCharacterIds
  delete cleaned.eventIds
  delete cleaned.parentSettingId
  return cleaned
}

watch(
  bookOptions,
  (books) => {
    if (!books.length) {
      selectedBookId.value = null
      return
    }

    if (!books.some((book) => book.id === selectedBookId.value)) {
      selectedBookId.value = books[0].id
    }
  },
  { immediate: true },
)

watch(
  selectedBookId,
  (bookId) => {
    const resolvedBookId = bookId || bookOptions.value[0]?.id || mockBooks[0]?.id || null
    workspaceData.value = cloneWorkspaceData(
      resolvedBookId ? getMockWorkspaceData(resolvedBookId) : null,
    )
  },
  { immediate: true },
)

const selectedWorkspace = computed(() => workspaceData.value)

function collectUniqueTags(workspace) {
  const sources = [
    workspace?.book?.tags || [],
    ...(workspace?.characters || []).map((item) => item.tags || []),
    ...(workspace?.events || []).map((item) => item.tags || []),
    ...(workspace?.settings || []).map((item) => item.tags || []),
    ...(workspace?.relationships || []).map((item) => item.tags || []),
  ]

  return Array.from(
    new Set(
      sources
        .flat()
        .map((tag) => String(tag).trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b))
}

const tagOptions = computed(() => collectUniqueTags(selectedWorkspace.value))

function mergeBookTags(tags) {
  if (!workspaceData.value || !tags?.length) {
    return
  }

  const currentTags = workspaceData.value.book?.tags || []
  const mergedTags = Array.from(
    new Set([...currentTags, ...tags].map((tag) => String(tag).trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))

  workspaceData.value = {
    ...workspaceData.value,
    book: {
      ...workspaceData.value.book,
      tags: mergedTags,
    },
  }

  saveCurrentWorkspace()
}

function setSelectedEntry(entity, type) {
  if (!entity) {
    selectedEntity.value = null
    return
  }

  selectedEntity.value = {
    id: entity.id,
    label: type === 'character' ? entity.name : type === 'event' ? entity.title : entity.name,
    type,
    icon:
      type === 'character'
        ? getIconForType('character')
        : type === 'event'
          ? getIconForType('event')
          : getIconForType('setting'),
    entity,
  }
}

function openCharacterModal(entity = null) {
  characterDraft.value = cloneEntity(entity)
  characterModalOpen.value = true
}

function openEventModal(entity = null) {
  eventDraft.value = cloneEntity(entity)
  eventModalOpen.value = true
}

function openLocationModal(entity = null) {
  locationDraft.value = cloneEntity(entity)
  locationModalOpen.value = true
}

function upsertEntity(collection, entity) {
  const items = [...(workspaceData.value?.[collection] || [])]
  const index = items.findIndex((item) => item.id === entity.id)
  if (index === -1) {
    items.push(entity)
  } else {
    items[index] = entity
  }
  return items
}

function syncRelationships(entityType, entity, relationships) {
  if (!workspaceData.value) {
    return
  }

  const nextRelationships = [...(workspaceData.value.relationships || [])].filter((rel) => {
    if (rel.sourceId !== entity.id && rel.targetId !== entity.id) {
      return true
    }

    // remove relationships involving this entity so the modal selections stay authoritative
    return false
  })

  nextRelationships.push(...(relationships || []))

  workspaceData.value = {
    ...workspaceData.value,
    relationships: nextRelationships,
  }
}

function onEntityEdit() {
  const entity = selectedEntity.value?.entity
  if (!entity) {
    return
  }

  if (selectedEntity.value?.type === 'character') {
    openCharacterModal(entity)
  } else if (selectedEntity.value?.type === 'event') {
    openEventModal(entity)
  } else if (selectedEntity.value?.type === 'setting') {
    openLocationModal(entity)
  }
}

function saveCharacter(payload) {
  if (!workspaceData.value) {
    return
  }

  const character = payload?.entity || payload

  const characters = upsertEntity('characters', character)

  workspaceData.value = { ...workspaceData.value, characters }
  mergeBookTags(character.tags)
  syncRelationships('character', character, payload?.relationships)
  setSelectedEntry(character, 'character')
  saveCurrentWorkspace()
}

function saveEvent(payload) {
  if (!workspaceData.value) {
    return
  }

  const event = payload?.entity || payload

  const events = upsertEntity('events', event)

  events.sort((left, right) => (left.sequenceOrder ?? 0) - (right.sequenceOrder ?? 0))
  workspaceData.value = { ...workspaceData.value, events }
  mergeBookTags(event.tags)
  syncRelationships('event', event, payload?.relationships)
  setSelectedEntry(event, 'event')
  saveCurrentWorkspace()
}

function saveLocation(payload) {
  if (!workspaceData.value) {
    return
  }

  const setting = payload?.entity || payload

  const settings = upsertEntity('settings', setting)

  workspaceData.value = { ...workspaceData.value, settings }
  mergeBookTags(setting.tags)
  syncRelationships('setting', setting, payload?.relationships)
  setSelectedEntry(setting, 'setting')
  saveCurrentWorkspace()
}

function deleteCharacter(characterId) {
  if (!workspaceData.value || !characterId) {
    return
  }

  const characters = [...(workspaceData.value.characters || [])]
  const index = characters.findIndex((item) => item.id === characterId)
  if (index !== -1) {
    characters.splice(index, 1)
  }

  workspaceData.value = { ...workspaceData.value, characters }
  workspaceData.value = {
    ...workspaceData.value,
    relationships: (workspaceData.value.relationships || []).filter(
      (rel) => rel.sourceId !== characterId && rel.targetId !== characterId,
    ),
  }
  selectedEntity.value = null
  saveCurrentWorkspace()
}

function deleteEvent(eventId) {
  if (!workspaceData.value || !eventId) {
    return
  }

  const events = [...(workspaceData.value.events || [])]
  const index = events.findIndex((item) => item.id === eventId)
  if (index !== -1) {
    events.splice(index, 1)
  }

  workspaceData.value = { ...workspaceData.value, events }
  workspaceData.value = {
    ...workspaceData.value,
    relationships: (workspaceData.value.relationships || []).filter(
      (rel) => rel.sourceId !== eventId && rel.targetId !== eventId,
    ),
  }
  selectedEntity.value = null
  saveCurrentWorkspace()
}

function deleteLocation(settingId) {
  if (!workspaceData.value || !settingId) {
    return
  }

  const settings = [...(workspaceData.value.settings || [])]
  const index = settings.findIndex((item) => item.id === settingId)
  if (index !== -1) {
    settings.splice(index, 1)
  }

  workspaceData.value = { ...workspaceData.value, settings }
  workspaceData.value = {
    ...workspaceData.value,
    relationships: (workspaceData.value.relationships || []).filter(
      (rel) => rel.sourceId !== settingId && rel.targetId !== settingId,
    ),
  }
  selectedEntity.value = null
  saveCurrentWorkspace()
}

function saveCurrentWorkspace() {
  const bookId = workspaceData.value?.book?.id || selectedBookId.value
  if (!bookId || !workspaceData.value) {
    return
  }

  saveMockWorkspaceData(bookId, workspaceData.value)
}

function getEntityCollection(workspace, type) {
  if (!workspace) {
    return []
  }

  switch (type) {
    case 'book':
      return [workspace.book].filter(Boolean)
    case 'character':
      return workspace.characters || []
    case 'event':
      return workspace.events || []
    case 'setting':
      return workspace.settings || []
    default:
      return []
  }
}

function findEntity(workspace, type, id) {
  return getEntityCollection(workspace, type).find((entity) => entity.id === id) || null
}

function formatDisplayName(entity, type) {
  if (!entity) {
    return 'Unknown'
  }

  switch (type) {
    case 'book':
      return entity.title || 'Untitled Book'
    case 'character':
      return entity.name || 'Unnamed Character'
    case 'event':
      return entity.title || 'Untitled Event'
    case 'setting':
      return entity.name || 'Unnamed Setting'
    default:
      return entity.name || entity.title || entity.id || 'Unknown'
  }
}

function getIconForType(type) {
  const iconMap = {
    character: 'person',
    Character: 'person',
    event: 'event',
    Event: 'event',
    setting: 'place',
    Setting: 'place',
  }
  return iconMap[type] || null
}

function addRelatedLink(items, seen, label, side, id) {
  const key = id || `${side}:${label}`
  if (seen.has(key)) {
    return
  }

  seen.add(key)
  const icon = getIconForType(side)
  items.push({ id: key, label, side, icon })
}

function collectCharacterLinks(workspace, character, items, seen) {
  // Character-to-character relationships
  workspace.relationships
    .filter(
      (relationship) =>
        relationship.sourceType === 'character' && relationship.targetType === 'character',
    )
    .filter(
      (relationship) =>
        relationship.sourceId === character.id || relationship.targetId === character.id,
    )
    .forEach((relationship) => {
      const otherId =
        relationship.sourceId === character.id ? relationship.targetId : relationship.sourceId
      const other = findEntity(workspace, 'character', otherId)

      if (!other) {
        return
      }

      addRelatedLink(items, seen, `${formatDisplayName(other, 'character')}`, 'Character', other.id)
    })

  // Character-to-event relationships
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === character.id &&
          relationship.sourceType === 'character' &&
          relationship.targetType === 'event') ||
        (relationship.targetId === character.id &&
          relationship.targetType === 'character' &&
          relationship.sourceType === 'event'),
    )
    .forEach((relationship) => {
      const eventId =
        relationship.sourceType === 'event' ? relationship.sourceId : relationship.targetId
      const event = findEntity(workspace, 'event', eventId)

      if (!event) {
        return
      }

      addRelatedLink(items, seen, `${formatDisplayName(event, 'event')}`, 'Event', event.id)
    })

  // Character-to-setting relationships
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === character.id &&
          relationship.sourceType === 'character' &&
          relationship.targetType === 'setting') ||
        (relationship.targetId === character.id &&
          relationship.targetType === 'character' &&
          relationship.sourceType === 'setting'),
    )
    .forEach((relationship) => {
      const settingId =
        relationship.sourceType === 'setting' ? relationship.sourceId : relationship.targetId
      const setting = findEntity(workspace, 'setting', settingId)

      if (!setting) {
        return
      }

      addRelatedLink(items, seen, `${formatDisplayName(setting, 'setting')}`, 'Setting', setting.id)
    })
}

function collectEventLinks(workspace, event, items, seen) {
  // Event-to-character relationships
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === event.id &&
          relationship.sourceType === 'event' &&
          relationship.targetType === 'character') ||
        (relationship.targetId === event.id &&
          relationship.targetType === 'event' &&
          relationship.sourceType === 'character'),
    )
    .forEach((relationship) => {
      const characterId =
        relationship.sourceType === 'character' ? relationship.sourceId : relationship.targetId
      const character = findEntity(workspace, 'character', characterId)

      if (!character) {
        return
      }

      addRelatedLink(
        items,
        seen,
        `${formatDisplayName(character, 'character')}`,
        'Character',
        character.id,
      )
    })

  // Event-to-setting relationships
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === event.id &&
          relationship.sourceType === 'event' &&
          relationship.targetType === 'setting') ||
        (relationship.targetId === event.id &&
          relationship.targetType === 'event' &&
          relationship.sourceType === 'setting'),
    )
    .forEach((relationship) => {
      const settingId =
        relationship.sourceType === 'setting' ? relationship.sourceId : relationship.targetId
      const setting = findEntity(workspace, 'setting', settingId)

      if (!setting) {
        return
      }

      addRelatedLink(items, seen, `${formatDisplayName(setting, 'setting')}`, 'Setting', setting.id)
    })
}

function collectSettingLinks(workspace, setting, items, seen) {
  // Setting-to-character relationships
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === setting.id &&
          relationship.sourceType === 'setting' &&
          relationship.targetType === 'character') ||
        (relationship.targetId === setting.id &&
          relationship.targetType === 'setting' &&
          relationship.sourceType === 'character'),
    )
    .forEach((relationship) => {
      const characterId =
        relationship.sourceType === 'character' ? relationship.sourceId : relationship.targetId
      const character = findEntity(workspace, 'character', characterId)

      if (!character) {
        return
      }

      addRelatedLink(
        items,
        seen,
        `${formatDisplayName(character, 'character')}`,
        'Character',
        character.id,
      )
    })

  // Setting-to-event relationships
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === setting.id &&
          relationship.sourceType === 'setting' &&
          relationship.targetType === 'event') ||
        (relationship.targetId === setting.id &&
          relationship.targetType === 'setting' &&
          relationship.sourceType === 'event'),
    )
    .forEach((relationship) => {
      const eventId =
        relationship.sourceType === 'event' ? relationship.sourceId : relationship.targetId
      const event = findEntity(workspace, 'event', eventId)

      if (!event) {
        return
      }

      addRelatedLink(items, seen, `${formatDisplayName(event, 'event')}`, 'Event', event.id)
    })
}

function collectRelationshipLinks(workspace, relationship, items, seen) {
  const source = findEntity(workspace, relationship.sourceType, relationship.sourceId)
  const target = findEntity(workspace, relationship.targetType, relationship.targetId)

  if (source) {
    addRelatedLink(
      items,
      seen,
      `Source: ${formatDisplayName(source, relationship.sourceType)}`,
      relationship.sourceType === 'character'
        ? 'Character'
        : relationship.sourceType === 'event'
          ? 'Event'
          : 'Setting',
      source.id,
    )
  }

  if (target) {
    addRelatedLink(
      items,
      seen,
      `Target: ${formatDisplayName(target, relationship.targetType)}`,
      relationship.targetType === 'character'
        ? 'Character'
        : relationship.targetType === 'event'
          ? 'Event'
          : 'Setting',
      target.id,
    )
  }
}

function collectBookLinks(workspace, items, seen) {
  workspace.characters.slice(0, 4).forEach((character) => {
    addRelatedLink(
      items,
      seen,
      `${formatDisplayName(character, 'character')}`,
      'Character',
      character.id,
    )
  })

  workspace.events.slice(0, 3).forEach((event) => {
    addRelatedLink(items, seen, `${formatDisplayName(event, 'event')}`, 'Event', event.id)
  })

  workspace.settings.slice(0, 3).forEach((setting) => {
    addRelatedLink(items, seen, `${formatDisplayName(setting, 'setting')}`, 'Setting', setting.id)
  })
}

function onRelatedLinkSelect(item) {
  if (!item) return

  const side = item.side || ''
  const id = item.id

  const mapping = {
    Character: 'characters',
    Event: 'events',
    Setting: 'settings',
    Relationship: 'relationships',
  }

  const filterType = mapping[side] || 'all'
  selectedEntityType.value = filterType

  // Find the matching entry in the current entries
  const entries = entityEntries.value || []
  const match = entries.find((e) => e.id === id)
  if (match) {
    selectedEntity.value = match
  }
}

function onDetailEntitySelect(entity) {
  if (!entity || !entity.id || !entity.type) return

  // Find the full entity in the workspace
  const foundEntity = findEntity(workspaceData.value, entity.type, entity.id)
  if (foundEntity) {
    setSelectedEntry(foundEntity, entity.type)
  }
}

const entityEntries = computed(() => {
  const workspace = selectedWorkspace.value
  if (!workspace) {
    return []
  }

  switch (selectedEntityType.value) {
    case 'books':
      return [
        {
          id: workspace.book.id,
          label: workspace.book.title,
          type: 'book',
          icon: 'book',
          entity: workspace.book,
        },
      ]
    case 'characters':
      return workspace.characters.map((character) => ({
        id: character.id,
        label: character.name,
        type: 'character',
        icon: getIconForType('character'),
        entity: character,
      }))
    case 'events':
      return workspace.events.map((event) => ({
        id: event.id,
        label: event.title,
        type: 'event',
        icon: getIconForType('event'),
        entity: event,
      }))
    case 'settings':
      return workspace.settings.map((setting) => ({
        id: setting.id,
        label: setting.name,
        type: 'setting',
        icon: getIconForType('setting'),
        entity: setting,
      }))
    case 'relationships':
      return workspace.relationships.map((relationship) => ({
        id: relationship.id,
        label: `${relationship.relationshipType}: ${relationship.sourceId} → ${relationship.targetId}`,
        type: 'relationship',
        icon: getIconForType('relationship'),
        entity: relationship,
      }))
    case 'all':
    default:
      return [
        {
          id: workspace.book.id,
          label: workspace.book.title,
          type: 'book',
          entity: workspace.book,
        },
        ...workspace.characters.slice(0, 4).map((character) => ({
          id: character.id,
          label: character.name,
          type: 'character',
          icon: getIconForType('character'),
          entity: character,
        })),
        ...workspace.events.slice(0, 2).map((event) => ({
          id: event.id,
          label: event.title,
          type: 'event',
          icon: getIconForType('event'),
          entity: event,
        })),
        ...workspace.settings.slice(0, 2).map((setting) => ({
          id: setting.id,
          label: setting.name,
          type: 'setting',
          icon: getIconForType('setting'),
          entity: setting,
        })),
      ]
  }
})

const filteredEntityEntries = computed(() => {
  const search = searchEntityText.value.toLowerCase().trim()
  if (!search) {
    return entityEntries.value
  }

  return entityEntries.value.filter((entry) => entry.label.toLowerCase().includes(search))
})

watch(
  entityEntries,
  (entries) => {
    if (!entries.length) {
      selectedEntity.value = null
      return
    }

    const existing = selectedEntity.value
    if (
      existing &&
      entries.some((entry) => entry.id === existing.id && entry.type === existing.type)
    ) {
      return
    }

    selectedEntity.value = entries[0] || null
  },
  { immediate: true },
)

// Respond to route query params for navigation from other pages
watch(
  () => route.query,
  (q) => {
    const bookId = q.book || q.b
    if (bookId) {
      selectedBookId.value = bookId
    }

    const type = q.type
    const id = q.id
    if (type && id) {
      // Map incoming type to selection filter
      const typeMap = {
        character: 'characters',
        event: 'events',
        setting: 'settings',
        relationship: 'relationships',
        book: 'books',
      }

      const desired = typeMap[type] || 'all'
      selectedEntityType.value = desired

      // Wait for entries to refresh then select
      const unwatch = watch(
        () => entityEntries.value,
        (entries) => {
          const found = (entries || []).find((e) => e.id === id)
          if (found) {
            selectedEntity.value = found
            unwatch()
            // clear query params to avoid re-triggering
            router.replace({ path: router.currentRoute.value.path, query: {} })
          }
        },
      )
    }
  },
  { immediate: true },
)

function onEntitySelect(entry) {
  selectedEntity.value = entry
}

const relatedLinks = computed(() => {
  const workspace = selectedWorkspace.value
  const selection = selectedEntity.value

  if (!workspace || !selection) {
    return []
  }

  const items = []
  const seen = new Set()

  switch (selection.type) {
    case 'character':
      collectCharacterLinks(workspace, selection.entity, items, seen)
      break
    case 'event':
      collectEventLinks(workspace, selection.entity, items, seen)
      break
    case 'setting':
      collectSettingLinks(workspace, selection.entity, items, seen)
      break
    case 'relationship':
      collectRelationshipLinks(workspace, selection.entity, items, seen)
      break
    case 'book':
    default:
      collectBookLinks(workspace, items, seen)
      break
  }

  return items
})
</script>

<style scoped>
.workspace-split-pane {
  min-height: 320px;
}

.workspace-entity-list-pane {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0;
  flex: 1;
  min-width: 0;
}

.workspace-entity-detail-pane {
  overflow: hidden;
  flex: 2;
  min-width: 0;
}

.workspace-entity-detail-pane :deep(.q-pa-md),
.workspace-entity-detail-pane :deep(.q-card-section) {
  padding: 0;
}

@media (max-width: 599px) {
  .workspace-split-pane {
    flex-wrap: wrap;
  }

  .workspace-entity-list-pane {
    border-right: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style>
