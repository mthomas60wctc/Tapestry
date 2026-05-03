<template>
  <q-card bordered class="full-height">
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
