<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="text-h6">{{ book.title || 'Untitled Book' }}</div>
    <div class="text-body2 text-grey-7">{{ book.author || 'Unknown author' }}</div>
    <q-separator class="q-my-sm" />
    <div><strong>Series:</strong> {{ book.series || 'Standalone' }}</div>
    <div><strong>Genre:</strong> {{ book.genre || 'N/A' }}</div>
    <div><strong>Status:</strong> {{ book.status || 'N/A' }}</div>
    <div><strong>Chapters:</strong> {{ book.chapters ?? 'N/A' }}</div>
    <div><strong>Visibility:</strong> {{ book.visibility || 'N/A' }}</div>
    <div v-if="book.description"><strong>Description:</strong> {{ book.description }}</div>
    <div v-if="book.tags?.length"><strong>Tags:</strong> {{ book.tags.join(', ') }}</div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  book: { type: Object, required: true },
})
</script>
