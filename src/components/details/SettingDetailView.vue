<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ setting.name || 'Unnamed Setting' }}</div>
    <div class="text-body2 text-grey-7">{{ setting.type || 'N/A' }}</div>
    <q-separator class="q-my-sm" />
    <div v-if="setting.description"><strong>Description:</strong> {{ setting.description }}</div>
    <div><strong>Ruler:</strong> {{ setting.ruler || 'N/A' }}</div>
    <div><strong>Climate:</strong> {{ setting.climate || 'N/A' }}</div>
    <div><strong>Population:</strong> {{ setting.population ?? 'N/A' }}</div>
    <div><strong>Related Characters:</strong> {{ setting.relatedCharacterIds?.length || 0 }}</div>
    <div v-if="setting.geography"><strong>Geography:</strong> {{ setting.geography }}</div>
    <div v-if="setting.tags?.length"><strong>Tags:</strong> {{ setting.tags.join(', ') }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  setting: { type: Object, required: true },
})
</script>
