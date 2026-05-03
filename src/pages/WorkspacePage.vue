<template>
  <div class="q-gutter-md">
    <q-card bordered flat>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-7">
          <WorkspaceSearch
            v-model="selectedBookId"
            :items="bookOptions"
            placeholder="Type to search books..."
          />
        </div>
        <div class="col-12 col-md-5">
          <q-input outlined dense label="Filters / Sort / Add Entity" />
        </div>
      </q-card-section>
    </q-card>

    <q-splitter v-model="splitter" bordered separator-class="bg-grey-4">
      <template #before>
        <q-card bordered flat class="full-height">
          <q-card-section class="text-subtitle1 text-weight-medium">Sidebar Tabs</q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="tab in workspaceTabs" :key="tab">
              <q-item-section>{{ tab }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </template>

      <template #after>
        <div class="q-gutter-md q-pl-md">
          <div class="row q-col-gutter-md items-stretch">
            <div class="col-12 col-lg-8">
              <q-card bordered flat>
                <q-card-section class="text-subtitle1 text-weight-medium"
                  >Entity List + Detail</q-card-section
                >
                <q-separator />
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-4">
                      <q-list bordered separator>
                        <q-item v-for="item in entityList" :key="item">
                          <q-item-section>{{ item }}</q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div class="col-12 col-sm-8">
                      <q-list bordered separator>
                        <q-item v-for="item in entityDetails" :key="item">
                          <q-item-section>{{ item }}</q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-lg-4">
              <q-card bordered flat>
                <q-card-section class="text-subtitle1 text-weight-medium"
                  >Related Links</q-card-section
                >
                <q-separator />
                <q-list separator>
                  <q-item v-for="link in relatedLinks" :key="link">
                    <q-item-section>{{ link }}</q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WorkspaceSearch from 'src/components/WorkspaceSearch.vue'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'

const splitter = ref(25)
const workspaceTabs = ['Characters', 'Events', 'Settings', 'Relationships', 'Notes']

const bookStore = useBookLibraryStore()
const { books: mockBooks } = createMockLibraryData()

const bookOptions = computed(() => {
  const userBooks = bookStore.userBooks || []
  if (userBooks.length) return userBooks
  return mockBooks
})

const selectedBookId = ref(null)

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

const entityList = computed(() => {
  const workspace = selectedWorkspace.value
  if (!workspace) {
    return ['No book selected']
  }

  return [
    ...workspace.characters.slice(0, 4).map((character) => character.name),
    ...workspace.events.slice(0, 2).map((event) => event.title),
    ...workspace.settings.slice(0, 2).map((setting) => setting.name),
  ]
})

const entityDetails = computed(() => {
  const workspace = selectedWorkspace.value
  if (!workspace) {
    return ['Select a book to inspect its workspace data.']
  }

  const [leadCharacter] = workspace.characters
  const [leadEvent] = workspace.events

  return [
    `${workspace.book.title} • ${workspace.book.author}`,
    `${workspace.characters.length} characters, ${workspace.events.length} events, ${workspace.settings.length} settings`,
    leadCharacter
      ? `Focus character: ${leadCharacter.name} (${leadCharacter.role})`
      : 'Focus character: none',
    leadEvent ? `Key event: ${leadEvent.title}` : 'Key event: none',
  ]
})

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
