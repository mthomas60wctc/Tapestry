<template>
  <div>
    <div v-if="!entity" class="q-pa-md text-grey-7">Select an item to view details.</div>
    <div v-else class="entity-detail-wrapper">
      <q-btn icon="edit" flat dense size="sm" class="entity-detail-edit-btn" />
      <BookDetailView v-if="resolvedType === 'book'" :book="entity" />
      <CharacterDetailView v-else-if="resolvedType === 'character'" :character="entity" />
      <EventDetailView v-else-if="resolvedType === 'event'" :event="entity" />
      <SettingDetailView v-else-if="resolvedType === 'setting'" :setting="entity" />
      <RelationshipDetailView v-else-if="resolvedType === 'relationship'" :relationship="entity" />
      <div v-else class="q-pa-md q-gutter-sm">
        <div class="text-h6">Unknown Entity</div>
        <div class="text-body2 text-grey-7">No renderer is available for this object type.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BookDetailView from 'src/components/details/BookDetailView.vue'
import CharacterDetailView from 'src/components/details/CharacterDetailView.vue'
import EventDetailView from 'src/components/details/EventDetailView.vue'
import SettingDetailView from 'src/components/details/SettingDetailView.vue'
import RelationshipDetailView from 'src/components/details/RelationshipDetailView.vue'

const props = defineProps({
  entity: { type: Object, default: null },
  type: { type: String, default: '' },
})

const resolvedType = computed(() => {
  if (props.type) {
    return props.type
  }

  const value = props.entity || {}

  if ('sourceType' in value && 'targetType' in value && 'relationshipType' in value) {
    return 'relationship'
  }

  if ('chapter' in value && 'sequenceOrder' in value && 'characterIds' in value) {
    return 'event'
  }

  if ('role' in value && 'aliases' in value && 'background' in value) {
    return 'character'
  }

  if ('type' in value && 'ruler' in value && 'relatedCharacterIds' in value) {
    return 'setting'
  }

  if ('author' in value && 'visibility' in value && 'chapters' in value) {
    return 'book'
  }

  return ''
})
</script>

<style scoped>
.entity-detail-wrapper {
  position: relative;
}

.entity-detail-edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>
