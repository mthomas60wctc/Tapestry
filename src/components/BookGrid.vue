<template>
  <div class="row q-col-gutter-sm">
    <div v-if="!books || books.length === 0" class="col-12">
      <q-banner class="bg-grey-1 text-center">No books found</q-banner>
    </div>
    <div v-else v-for="book in books" :key="book.id" class="col-12 col-sm-6 col-md-4">
      <BookCard :book="book" @select="emit('select', book)" />
    </div>
  </div>
</template>

<script setup>
import BookCard from 'src/components/BookCard.vue'
const emit = defineEmits(['select'])

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  books: { type: Array, default: () => [] },
})
</script>
