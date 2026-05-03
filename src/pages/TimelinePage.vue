<template>
  <div class="q-gutter-md">
    <q-chip outline color="primary" icon="filter_list">
      Character / Chapter / Arc / Setting
    </q-chip>

    <q-timeline color="primary">
      <q-timeline-entry
        v-for="(event, index) in timelineEvents"
        :key="event.title"
        :title="event.title"
        :subtitle="event.subtitle"
        :icon="index % 2 === 0 ? 'event' : 'radio_button_checked'"
      >
        <div class="text-body2 text-grey-8">
          {{ event.description }}
        </div>
      </q-timeline-entry>
    </q-timeline>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-8">
        <q-card bordered flat>
          <q-card-section class="text-subtitle1 text-weight-medium"
            >Selected Event Detail</q-card-section
          >
          <q-separator />
          <q-list separator>
            <q-item v-for="detail in selectedEventDetails" :key="detail">
              <q-item-section>{{ detail }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card bordered flat>
          <q-card-section class="text-subtitle1 text-weight-medium">Quick Jump</q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="jump in quickJumps" :key="jump">
              <q-item-section>{{ jump }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'

const { books: mockBooks } = createMockLibraryData()
const selectedWorkspace = computed(() => getMockWorkspaceData(mockBooks[0]?.id))

const timelineEvents = computed(() => {
  const events = selectedWorkspace.value?.events || []

  return events.map((event) => ({
    title: event.title,
    subtitle: event.chapterTitle || `Chapter ${event.chapter ?? 'N/A'}`,
    description: event.description,
  }))
})

const selectedEventDetails = computed(() => {
  const [event] = selectedWorkspace.value?.events || []

  if (!event) {
    return ['No event selected']
  }

  return [
    `${event.title}`,
    `Chapter ${event.chapter ?? 'N/A'}${event.chapterTitle ? ` • ${event.chapterTitle}` : ''}`,
    `Characters involved: ${event.characterIds.length}`,
    `Settings involved: ${event.settingIds.length}`,
  ]
})

const quickJumps = computed(() => {
  const events = selectedWorkspace.value?.events || []
  return events.slice(0, 2).map((event) => event.title)
})
</script>
