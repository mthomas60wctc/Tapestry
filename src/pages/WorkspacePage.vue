<template>
  <div>
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-12 col-md-7">
        <WorkspaceSearch v-model="selectedBookId" :items="bookOptions" />
      </div>
      <div class="col-12 col-md-5">
        <q-input outlined dense label="Filters / Sort / Add Entity" />
      </div>
    </div>

    <div>
      <div class="row q-col-gutter-md items-stretch">
        <div class="col-12 col-lg-8">
          <q-card bordered flat>
            <q-card-section class="row items-center q-col-gutter-md q-pa-md q-pb-sm">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">Entity List + Detail</div>
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
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-none">
              <div class="row no-wrap items-stretch workspace-split-pane">
                <div class="col workspace-entity-list-pane">
                  <ItemSelectionList
                    :items="entityEntries"
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WorkspaceSearch from 'src/components/WorkspaceSearch.vue'
import ItemSelectionList from 'src/components/ItemSelectionList.vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
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
const selectedEntity = ref(null)

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

const selectedWorkspace = computed(() => {
  const bookId = selectedBookId.value || bookOptions.value[0]?.id || null
  if (!bookId) {
    return null
  }

  return getMockWorkspaceData(bookId) || getMockWorkspaceData(mockBooks[0]?.id)
})

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
        `Character: ${formatDisplayName(character, 'character')}`,
        'Character',
        character.id,
      )
    })

  event.settingIds
    ?.map((settingId) => findEntity(workspace, 'setting', settingId))
    .filter(Boolean)
    .forEach((setting) => {
      addRelatedLink(
        items,
        seen,
        `Setting: ${formatDisplayName(setting, 'setting')}`,
        'Setting',
        setting.id,
      )
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
        `Character: ${formatDisplayName(character, 'character')}`,
        'Character',
        character.id,
      )
    })

  workspace.events
    .filter((event) => event.settingIds?.includes(setting.id))
    .forEach((event) => {
      addRelatedLink(items, seen, `Event: ${formatDisplayName(event, 'event')}`, 'Event', event.id)
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
      `Character: ${formatDisplayName(character, 'character')}`,
      'Character',
      character.id,
    )
  })

  workspace.events.slice(0, 3).forEach((event) => {
    addRelatedLink(items, seen, `Event: ${formatDisplayName(event, 'event')}`, 'Event', event.id)
  })

  workspace.settings.slice(0, 3).forEach((setting) => {
    addRelatedLink(
      items,
      seen,
      `Setting: ${formatDisplayName(setting, 'setting')}`,
      'Setting',
      setting.id,
    )
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
