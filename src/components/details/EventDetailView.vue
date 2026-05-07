<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ event.title || 'Untitled Event' }}</div>
    <div class="text-body2 text-grey-7">{{ chapterLabel }}</div>
    <q-separator class="q-my-sm" />
    <div v-if="event.description"><strong>Description:</strong> {{ event.description }}</div>
    <div><strong>Arc:</strong> {{ event.arc || 'N/A' }}</div>
    <div><strong>Emotional Tone:</strong> {{ event.emotionalTone || 'N/A' }}</div>
    <div><strong>Sequence:</strong> {{ event.sequenceOrder ?? 'N/A' }}</div>
    <div><strong>Characters Involved:</strong> {{ event.characterIds?.length || 0 }}</div>
    <div><strong>Settings Involved:</strong> {{ event.settingIds?.length || 0 }}</div>
    <div v-if="event.tags?.length"><strong>Tags:</strong> {{ event.tags.join(', ') }}</div>
    <div v-if="event.notes"><strong>Notes:</strong> {{ event.notes }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: { type: Object, required: true },
})

const chapterLabel = computed(() => {
  if (props.event.chapterTitle) {
    return `Chapter ${props.event.chapter ?? 'N/A'} • ${props.event.chapterTitle}`
  }

  return `Chapter ${props.event.chapter ?? 'N/A'}`
})
</script>
