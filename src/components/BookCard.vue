<template>
  <q-card flat bordered class="full-height book-card">
    <q-card-section class="row no-wrap items-start q-gutter-sm q-pa-md">
      <q-avatar color="primary" text-color="white" size="44px">{{ book.cover }}</q-avatar>
      <div>
        <div class="text-subtitle2 text-weight-medium">{{ book.title }}</div>
        <div class="text-caption text-grey-7">{{ book.series || book.author }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  book: { type: Object, required: true },
})
</script>
<style scoped>
.book-card {
  background-color: #f5f5f5;
  color: #333;
}

:global(.body--dark) .book-card {
  background-color: #2a2a2a;
  color: #e0e0e0;
}

.book-card :deep(.text-subtitle2) {
  color: inherit;
}

.book-card :deep(.text-caption) {
  color: #666;
}

:global(.body--dark) .book-card :deep(.text-caption) {
  color: #999;
}
</style>
