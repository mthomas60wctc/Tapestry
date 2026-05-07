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
          <QuickLinksCard title="Related Links" :items="relatedLinks" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WorkspaceSearch from 'src/components/WorkspaceSearch.vue'
import ItemSelectionList from 'src/components/ItemSelectionList.vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'

const entityFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Books', value: 'books' },
  { label: 'Characters', value: 'characters' },
  { label: 'Events', value: 'events' },
  { label: 'Settings', value: 'settings' },
  { label: 'Relationships', value: 'relationships' },
]

const bookStore = useBookLibraryStore()
const { books: mockBooks } = createMockLibraryData()

const bookOptions = computed(() => {
  const userBooks = bookStore.userBooks || []
  if (userBooks.length) return userBooks
  return mockBooks
})

const selectedBookId = ref(null)
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
          entity: workspace.book,
        },
      ]
    case 'characters':
      return workspace.characters.map((character) => ({
        id: character.id,
        label: character.name,
        type: 'character',
        entity: character,
      }))
    case 'events':
      return workspace.events.map((event) => ({
        id: event.id,
        label: event.title,
        type: 'event',
        entity: event,
      }))
    case 'settings':
      return workspace.settings.map((setting) => ({
        id: setting.id,
        label: setting.name,
        type: 'setting',
        entity: setting,
      }))
    case 'relationships':
      return workspace.relationships.map((relationship) => ({
        id: relationship.id,
        label: `${relationship.relationshipType}: ${relationship.sourceId} → ${relationship.targetId}`,
        type: 'relationship',
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
          entity: character,
        })),
        ...workspace.events.slice(0, 2).map((event) => ({
          id: event.id,
          label: event.title,
          type: 'event',
          entity: event,
        })),
        ...workspace.settings.slice(0, 2).map((setting) => ({
          id: setting.id,
          label: setting.name,
          type: 'setting',
          entity: setting,
        })),
      ]
  }
})

watch(
  entityEntries,
  (entries) => {
    selectedEntity.value = entries[0] || null
  },
  { immediate: true },
)

function onEntitySelect(entry) {
  selectedEntity.value = entry
}

const relatedLinks = computed(() => {
  const workspace = selectedWorkspace.value
  if (!workspace) {
    return []
  }

  return workspace.relationships.slice(0, 3).map((relationship) => {
    return `${relationship.relationshipType}: ${relationship.sourceId} → ${relationship.targetId}`
  })
})
</script>

<style scoped>
.workspace-split-pane {
  min-height: 320px;
}

.workspace-entity-list-pane {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0;
}

.workspace-entity-detail-pane {
  overflow: hidden;
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
