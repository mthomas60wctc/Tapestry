<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ event.title || 'Untitled Event' }}</div>
    <div class="text-body2 text-grey-7">{{ chapterLabel }}</div>
    <q-separator class="q-my-sm" />
    <div v-if="event.description"><strong>Description:</strong> {{ event.description }}</div>
    <div><strong>Arc:</strong> {{ event.arc || 'N/A' }}</div>
    <div><strong>Emotional Tone:</strong> {{ event.emotionalTone || 'N/A' }}</div>
    <div><strong>Sequence:</strong> {{ event.sequenceOrder ?? 'N/A' }}</div>
    <div><strong>Characters Involved:</strong> {{ characterCount }}</div>
    <div><strong>Settings Involved:</strong> {{ settingCount }}</div>
    <div v-if="event.tags?.length"><strong>Tags:</strong> {{ event.tags.join(', ') }}</div>
    <div v-if="event.notes"><strong>Notes:</strong> {{ event.notes }}</div>

    <!-- Related Entities (Chips) -->
    <div v-if="relatedEntities.length">
      <q-separator />
      <div><strong>Related Characters and Locations:</strong></div>
      <div class="q-gutter-sm">
        <q-chip
          v-for="entity in relatedEntities"
          :key="entity.id"
          clickable
          :icon="getIconForEntityType(entity.type)"
          class="related-entity-chip"
          @click="onRelatedEntityClick(entity)"
        >
          {{ entity.label }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: { type: Object, required: true },
  workspace: { type: Object, default: null },
})

const emit = defineEmits(['select-entity'])

const chapterLabel = computed(() => {
  if (props.event.chapterTitle) {
    return `Chapter ${props.event.chapter ?? 'N/A'} • ${props.event.chapterTitle}`
  }

  return `Chapter ${props.event.chapter ?? 'N/A'}`
})

const relatedEntities = computed(() => {
  if (!props.workspace) return []

  const related = new Map()

  // Query ALL relationships where this event is involved
  props.workspace.relationships?.forEach((rel) => {
    const isSource = rel.sourceId === props.event.id && rel.sourceType === 'event'
    const isTarget = rel.targetId === props.event.id && rel.targetType === 'event'

    if (isSource) {
      // Event is the source - get target entity
      let targetEntity = null
      if (rel.targetType === 'character') {
        targetEntity = props.workspace.characters?.find((c) => c.id === rel.targetId)
      } else if (rel.targetType === 'setting') {
        targetEntity = props.workspace.settings?.find((s) => s.id === rel.targetId)
      }

      if (targetEntity) {
        related.set(`${rel.targetType}-${rel.targetId}`, {
          id: rel.targetId,
          label: targetEntity.name || targetEntity.title || 'Untitled',
          type: rel.targetType,
        })
      }
    } else if (isTarget) {
      // Event is the target - get source entity
      let sourceEntity = null
      if (rel.sourceType === 'character') {
        sourceEntity = props.workspace.characters?.find((c) => c.id === rel.sourceId)
      } else if (rel.sourceType === 'setting') {
        sourceEntity = props.workspace.settings?.find((s) => s.id === rel.sourceId)
      }

      if (sourceEntity) {
        related.set(`${rel.sourceType}-${rel.sourceId}`, {
          id: rel.sourceId,
          label: sourceEntity.name || sourceEntity.title || 'Untitled',
          type: rel.sourceType,
        })
      }
    }
  })

  return Array.from(related.values()).sort((a, b) => a.label.localeCompare(b.label))
})

const characterCount = computed(() => {
  if (!props.workspace) return 0
  return relatedEntities.value.filter((entity) => entity.type === 'character').length
})

const settingCount = computed(() => {
  if (!props.workspace) return 0
  return relatedEntities.value.filter((entity) => entity.type === 'setting').length
})

function getIconForEntityType(type) {
  const icons = {
    character: 'person',
    event: 'event',
    setting: 'place',
  }
  return icons[type] || 'help'
}

function onRelatedEntityClick(entity) {
  emit('select-entity', entity)
}
</script>

<style scoped>
.related-entity-chip {
  cursor: pointer;
}
</style>
