<template>
  <div>
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-12 col-md-8">
        <q-input
          v-model="searchEventText"
          outlined
          dense
          placeholder="Search events..."
          clearable
        />
      </div>
    </div>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-8">
        <q-timeline color="primary">
          <q-timeline-entry
            v-for="(event, index) in filteredTimelineEvents"
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
          <q-card
            bordered
            flat
            class="interactive-card q-hoverable cursor-pointer"
            @click="openSelectedEventInWorkspace"
          >
            <q-card-section class="text-subtitle1 text-weight-medium"
              >Selected Event Detail</q-card-section
            >
            <q-separator />
            <EntityDetailView :entity="selectedEvent" type="event" />
          </q-card>

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
import { computed, ref, watch } from 'vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { buildRelatedLinks } from 'src/utils/relatedLinks'
import { cloneWorkspaceData, loadWorkspaceFromFirestore } from 'src/utils/firestoreWorkspace'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'
import { useRouter } from 'vue-router'

const bookLibraryStore = useBookLibraryStore()
const bookOptions = computed(() => bookLibraryStore.userBooks || [])

const workspaceStore = useBookWorkspaceStore()
const router = useRouter()
const selectedBookId = computed({
  get: () => workspaceStore.currentBookId,
  set: (value) => {
    workspaceStore.currentBookId = value
  },
})
const selectedEventId = ref(null)
const searchEventText = ref('')
const selectedWorkspace = ref(null)

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
  async (bookId) => {
    const workspace = await loadWorkspaceFromFirestore(bookId)
    selectedWorkspace.value = cloneWorkspaceData(workspace)
  },
  { immediate: true },
)

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

const filteredTimelineEvents = computed(() => {
  const search = searchEventText.value.toLowerCase().trim()
  if (!search) {
    return timelineEvents.value
  }

  return timelineEvents.value.filter((event) => {
    const titleMatch = event.title?.toLowerCase().includes(search)
    const descriptionMatch = event.description?.toLowerCase().includes(search)
    const chapterMatch = event.chapterTitle?.toLowerCase().includes(search)
    return titleMatch || descriptionMatch || chapterMatch
  })
})

const relatedLinks = computed(() =>
  buildRelatedLinks(selectedWorkspace.value, {
    type: 'event',
    entity: selectedEvent.value,
  }),
)

function onRelatedLinkSelect(item) {
  if (!item) return
  const bookId = selectedBookId.value
  if (bookId) {
    workspaceStore.currentBookId = bookId
    router.push({
      path: '/workspace',
      query: { book: bookId, type: item.side?.toLowerCase(), id: item.id },
    })
  }
}

function openSelectedEventInWorkspace() {
  const bookId = selectedBookId.value
  const eventId = selectedEvent.value?.id
  if (!bookId || !eventId) {
    return
  }

  workspaceStore.currentBookId = bookId
  router.push({
    path: '/workspace',
    query: { book: bookId, type: 'event', id: eventId },
  })
}
</script>
<style scoped>
.timeline-entry-selected {
  background-color: rgba(33, 150, 243, 0.1);
}
</style>
