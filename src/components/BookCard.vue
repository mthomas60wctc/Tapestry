<template>
  <q-card
    flat
    bordered
    class="full-height book-card cursor-pointer q-hoverable"
    @click="emit('select', book)"
  >
    <div class="row no-wrap items-stretch full-height">
      <div class="book-cover-container">
        <div class="book-cover">
          <img v-if="coverSrc && !imgError" :src="coverSrc" @error="imgError = true" alt="cover" />
          <q-avatar v-else color="primary" text-color="white" size="64px">{{
            avatarText
          }}</q-avatar>
        </div>
      </div>
      <q-card-section class="col q-pa-md">
        <div class="text-subtitle2 text-weight-medium">{{ book.title }}</div>
        <div class="text-caption text-grey-7">{{ book.series || book.author }}</div>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
const emit = defineEmits(['select'])

const props = defineProps({
  book: { type: Object, required: true },
})

const imgError = ref(false)

const coverSrc = computed(() => {
  if (!props.book) return null
  const cover = props.book.cover
  if (!cover) return null
  if (typeof cover === 'string' && (cover.startsWith('http') || cover.startsWith('/'))) return cover
  if (typeof cover === 'string') return `/covers/${cover}.jpg`
  return null
})

const avatarText = computed(() => {
  if (!props.book) return ''
  if (props.book.title) return props.book.title.charAt(0)
  return props.book.cover || ''
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

.book-cover img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 0;
  display: block;
}

.book-cover-container {
  flex-shrink: 0;
  overflow: hidden;
}

.book-cover {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
