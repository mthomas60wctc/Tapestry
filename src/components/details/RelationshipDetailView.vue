<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ relationship.relationshipType || 'Relationship' }}</div>
    <div class="text-body2 text-grey-7">
      {{ relationship.sourceType }} → {{ relationship.targetType }}
    </div>
    <q-separator class="q-my-sm" />
    <div><strong>Source:</strong> {{ relationship.sourceId || 'N/A' }}</div>
    <div><strong>Target:</strong> {{ relationship.targetId || 'N/A' }}</div>
    <div><strong>Strength:</strong> {{ relationship.strength || 'N/A' }}</div>
    <div><strong>Bidirectional:</strong> {{ relationship.bidirectional ? 'Yes' : 'No' }}</div>
    <div v-if="relationship.description">
      <strong>Description:</strong> {{ relationship.description }}
    </div>
    <div v-if="relationship.tags?.length">
      <strong>Tags:</strong> {{ relationship.tags.join(', ') }}
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  relationship: { type: Object, required: true },
})
</script>
