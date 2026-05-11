<template>
  <div>
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-12 col-md-7">
        <WorkspaceSearch v-model="selectedBookId" :items="bookOptions" />
      </div>
      <div class="col-12 col-md-5">
        <q-chip outline color="primary" icon="filter_list">
          Character / Chapter / Arc / Setting
        </q-chip>
      </div>
    </div>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-8">
        <q-timeline color="primary">
          <q-timeline-entry
            v-for="(event, index) in timelineEvents"
            :key="event.id"
            :title="event.title"
            :subtitle="event.chapterTitle || `Chapter ${event.chapter ?? 'N/A'}`"
            :icon="index % 2 === 0 ? 'event' : 'radio_button_checked'"
            :class="['cursor-pointer', { 'timeline-entry-selected': event.id === selectedEventId }]"
            @click="selectedEventId = event.id"
          >
            <div class="text-body2 text-grey-8">
              {{ event.description }}
            </div>
          </q-timeline-entry>
        </q-timeline>
      </div>

      <div class="col-12 col-md-4">
        <div class="q-gutter-md">
          <q-card bordered flat class="interactive-card q-hoverable cursor-pointer">
            <q-card-section class="text-subtitle1 text-weight-medium"
              >Selected Event Detail</q-card-section
            >
            <q-separator />
            <EntityDetailView :entity="selectedEvent" type="event" />
          </q-card>

          <QuickLinksCard title="Quick Jump" :items="quickJumps" @select="onQuickJumpSelect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import WorkspaceSearch from 'src/components/WorkspaceSearch.vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'
import { useRouter } from 'vue-router'

const { books: mockBooks } = createMockLibraryData()
const bookOptions = computed(() => mockBooks)

const workspaceStore = useBookWorkspaceStore()
const router = useRouter()
const selectedBookId = computed({
  get: () => workspaceStore.currentBookId,
  set: (value) => {
    workspaceStore.currentBookId = value
  },
})
const selectedEventId = ref(null)

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

const selectedWorkspace = computed(() => getMockWorkspaceData(selectedBookId.value))

watch(
  () => selectedWorkspace.value?.events,
  (events) => {
    selectedEventId.value = events?.[0]?.id || null
  },
  { immediate: true },
)

const selectedEvent = computed(() => {
  const events = selectedWorkspace.value?.events || []
  return events.find((event) => event.id === selectedEventId.value) || events[0] || null
})

const timelineEvents = computed(() => {
  return selectedWorkspace.value?.events || []
})

const quickJumps = computed(() => {
  const events = selectedWorkspace.value?.events || []
  return events
    .slice(0, 2)
    .map((event) => ({ id: event.id, type: 'event', label: event.title, icon: 'event' }))
})

function onQuickJumpSelect(item) {
  if (!item) return
  const bookId = selectedBookId.value
  if (bookId) {
    workspaceStore.currentBookId = bookId
    router.push({ path: '/workspace', query: { book: bookId, type: item.type, id: item.id } })
  }
}
</script>
<style scoped>
.timeline-entry-selected {
  background-color: rgba(33, 150, 243, 0.1);
}
</style>
