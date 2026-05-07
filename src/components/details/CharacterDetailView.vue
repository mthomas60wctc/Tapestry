<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ character.name || 'Unnamed Character' }}</div>
    <div class="text-body2 text-grey-7">{{ character.role || 'N/A' }}</div>
    <q-separator class="q-my-sm" />
    <div><strong>Status:</strong> {{ character.status || 'N/A' }}</div>
    <div v-if="character.aliases?.length">
      <strong>Aliases:</strong> {{ character.aliases.join(', ') }}
    </div>
    <div v-if="character.description">
      <strong>Description:</strong> {{ character.description }}
    </div>
    <div v-if="character.background"><strong>Background:</strong> {{ character.background }}</div>
    <div><strong>First Appearance:</strong> {{ character.firstAppearance || 'N/A' }}</div>
    <div v-if="character.tags?.length"><strong>Tags:</strong> {{ character.tags.join(', ') }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  character: { type: Object, required: true },
})
</script>
