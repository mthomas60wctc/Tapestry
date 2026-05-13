<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ setting.name || 'Unnamed Setting' }}</div>
    <div class="text-body2 text-grey-7">{{ setting.type || 'N/A' }}</div>
    <q-separator class="q-my-sm" />
    <div v-if="setting.description"><strong>Description:</strong> {{ setting.description }}</div>
    <div><strong>Ruler:</strong> {{ setting.ruler || 'N/A' }}</div>
    <div><strong>Climate:</strong> {{ setting.climate || 'N/A' }}</div>
    <div><strong>Population:</strong> {{ setting.population ?? 'N/A' }}</div>
    <div><strong>Related Characters:</strong> {{ characterCount }}</div>
    <div v-if="setting.geography"><strong>Geography:</strong> {{ setting.geography }}</div>
    <div v-if="setting.tags?.length"><strong>Tags:</strong> {{ setting.tags.join(', ') }}</div>

    <!-- Related Entities (Chips) -->
    <div v-if="relatedEntities.length">
      <q-separator />
      <div><strong>Related Characters and Events:</strong></div>
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
  setting: { type: Object, required: true },
  workspace: { type: Object, default: null },
})

const emit = defineEmits(['select-entity'])

const relatedEntities = computed(() => {
  if (!props.workspace) return []

  const related = new Map()

  // Query ALL relationships where this setting is involved
  props.workspace.relationships?.forEach((rel) => {
    const isSource = rel.sourceId === props.setting.id && rel.sourceType === 'setting'
    const isTarget = rel.targetId === props.setting.id && rel.targetType === 'setting'

    if (isSource) {
      // Setting is the source - get target entity
      let targetEntity = null
      if (rel.targetType === 'character') {
        targetEntity = props.workspace.characters?.find((c) => c.id === rel.targetId)
      } else if (rel.targetType === 'event') {
        targetEntity = props.workspace.events?.find((e) => e.id === rel.targetId)
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
      // Setting is the target - get source entity
      let sourceEntity = null
      if (rel.sourceType === 'character') {
        sourceEntity = props.workspace.characters?.find((c) => c.id === rel.sourceId)
      } else if (rel.sourceType === 'event') {
        sourceEntity = props.workspace.events?.find((e) => e.id === rel.sourceId)
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
