<template>
  <div>
    <div>
      <div class="row q-col-gutter-md items-stretch">
        <div class="col-12 col-lg-8">
          <q-card bordered flat>
            <q-card-section class="row items-center q-col-gutter-md q-pa-md q-pb-sm">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">Threads</div>
              </div>
              <div class="col-auto" style="min-width: 200px">
                <q-input
                  v-model="searchEntityText"
                  outlined
                  dense
                  placeholder="Search entities..."
                  clearable
                />
              </div>
              <div class="col-auto" style="min-width: 200px">
                <q-select
                  v-model="selectedEntityType"
                  :options="entityFilterOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Filter Entity"
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
                    @edit="onEntityEdit"
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
    </div>

    <CharacterModal
      v-model="characterModalOpen"
      :book-id="selectedBookId"
      :entity="characterDraft"
      :tag-options="tagOptions"
      @save="saveCharacter"
      @delete="deleteCharacter"
    />

    <EventModal
      v-model="eventModalOpen"
      :book-id="selectedBookId"
      :entity="eventDraft"
      :character-options="characterOptions"
      :setting-options="settingOptions"
      :tag-options="tagOptions"
      @save="saveEvent"
      @delete="deleteEvent"
    />

    <LocationModal
      v-model="locationModalOpen"
      :book-id="selectedBookId"
      :entity="locationDraft"
      :character-options="characterOptions"
      :parent-setting-options="parentSettingOptions"
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
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'

const entityFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Characters', value: 'characters' },
  { label: 'Events', value: 'events' },
  { label: 'Settings', value: 'settings' },
  { label: 'Relationships', value: 'relationships' },
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

  return globalThis.structuredClone
    ? globalThis.structuredClone(workspace)
    : JSON.parse(JSON.stringify(workspace))
}

function cloneEntity(entity) {
  if (!entity) return null
  // Create a plain object copy from the entity, avoiding Proxy issues
  return {
    ...entity,
    aliases: entity.aliases ? [...entity.aliases] : [],
    tags: entity.tags ? [...entity.tags] : [],
    characterIds: entity.characterIds ? [...entity.characterIds] : [],
    settingIds: entity.settingIds ? [...entity.settingIds] : [],
    relatedCharacterIds: entity.relatedCharacterIds ? [...entity.relatedCharacterIds] : [],
  }
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

const characterOptions = computed(() =>
  (selectedWorkspace.value?.characters || []).map((character) => ({
    label: character.name,
    value: character.id,
  })),
)

const settingOptions = computed(() =>
  (selectedWorkspace.value?.settings || []).map((setting) => ({
    label: setting.name,
    value: setting.id,
  })),
)

const parentSettingOptions = computed(() => {
  const excludedId = locationDraft.value?.id || null
  return (selectedWorkspace.value?.settings || [])
    .filter((setting) => setting.id !== excludedId)
    .map((setting) => ({ label: setting.name, value: setting.id }))
})

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
}

function setSelectedEntry(entity, type) {
  if (!entity) {
    selectedEntity.value = null
    return
  }

  selectedEntityType.value =
    type === 'character'
      ? 'characters'
      : type === 'event'
        ? 'events'
        : type === 'setting'
          ? 'settings'
          : selectedEntityType.value

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

function saveCharacter(character) {
  if (!workspaceData.value) {
    return
  }

  const characters = [...(workspaceData.value.characters || [])]
  const index = characters.findIndex((item) => item.id === character.id)
  if (index === -1) {
    characters.push(character)
  } else {
    characters[index] = character
  }

  workspaceData.value = { ...workspaceData.value, characters }
  mergeBookTags(character.tags)
  setSelectedEntry(character, 'character')
}

function saveEvent(event) {
  if (!workspaceData.value) {
    return
  }

  const events = [...(workspaceData.value.events || [])]
  const index = events.findIndex((item) => item.id === event.id)
  if (index === -1) {
    events.push(event)
  } else {
    events[index] = event
  }

  events.sort((left, right) => (left.sequenceOrder ?? 0) - (right.sequenceOrder ?? 0))
  workspaceData.value = { ...workspaceData.value, events }
  mergeBookTags(event.tags)
  setSelectedEntry(event, 'event')
}

function saveLocation(setting) {
  if (!workspaceData.value) {
    return
  }

  const settings = [...(workspaceData.value.settings || [])]
  const index = settings.findIndex((item) => item.id === setting.id)
  if (index === -1) {
    settings.push(setting)
  } else {
    settings[index] = setting
  }

  workspaceData.value = { ...workspaceData.value, settings }
  mergeBookTags(setting.tags)
  setSelectedEntry(setting, 'setting')
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
  selectedEntity.value = null
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
  selectedEntity.value = null
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
  selectedEntity.value = null
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
    case 'relationship':
      return workspace.relationships || []
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
    case 'relationship':
      return entity.relationshipType || 'Relationship'
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
    relationship: 'link',
    Relationship: 'link',
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
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === character.id && relationship.sourceType === 'character') ||
        (relationship.targetId === character.id && relationship.targetType === 'character'),
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

  workspace.events
    .filter((event) => event.characterIds?.includes(character.id))
    .forEach((event) => {
      addRelatedLink(
        items,
        seen,
        `Participates In: ${formatDisplayName(event, 'event')}`,
        'Event',
        event.id,
      )
    })

  workspace.settings
    .filter(
      (setting) =>
        setting.relatedCharacterIds?.includes(character.id) ||
        workspace.relationships.some(
          (relationship) =>
            ((relationship.sourceId === character.id && relationship.sourceType === 'character') ||
              (relationship.targetId === character.id &&
                relationship.targetType === 'character')) &&
            ((relationship.sourceId === setting.id && relationship.sourceType === 'setting') ||
              (relationship.targetId === setting.id && relationship.targetType === 'setting')),
        ),
    )
    .forEach((setting) => {
      addRelatedLink(
        items,
        seen,
        `Associated With: ${formatDisplayName(setting, 'setting')}`,
        'Setting',
        setting.id,
      )
    })
}

function collectEventLinks(workspace, event, items, seen) {
  event.characterIds
    ?.map((characterId) => findEntity(workspace, 'character', characterId))
    .filter(Boolean)
    .forEach((character) => {
      addRelatedLink(
        items,
        seen,
        `${formatDisplayName(character, 'character')}`,
        'Character',
        character.id,
      )
    })

  event.settingIds
    ?.map((settingId) => findEntity(workspace, 'setting', settingId))
    .filter(Boolean)
    .forEach((setting) => {
      addRelatedLink(items, seen, `${formatDisplayName(setting, 'setting')}`, 'Setting', setting.id)
    })
}

function collectSettingLinks(workspace, setting, items, seen) {
  setting.relatedCharacterIds
    ?.map((characterId) => findEntity(workspace, 'character', characterId))
    .filter(Boolean)
    .forEach((character) => {
      addRelatedLink(
        items,
        seen,
        `${formatDisplayName(character, 'character')}`,
        'Character',
        character.id,
      )
    })

  workspace.events
    .filter((event) => event.settingIds?.includes(setting.id))
    .forEach((event) => {
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
