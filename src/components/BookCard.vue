<template>
  <q-card
    flat
    bordered
    class="full-height book-card cursor-pointer q-hoverable"
    @click="emit('select', book)"
  >
    <q-btn
      flat
      round
      dense
      icon="edit"
      class="book-card-edit-btn"
      @click.stop="emit('edit', book)"
    />
    <div class="row no-wrap items-start">
      <div class="book-cover-container">
        <div class="book-cover">
          <img v-if="coverSrc && !imgError" :src="coverSrc" @error="imgError = true" alt="cover" />
          <q-avatar v-else color="primary" text-color="white" size="64px">{{
            avatarText
          }}</q-avatar>
        </div>
      </div>
      <q-card-section class="col q-pa-md q-ml-sm">
        <div class="text-subtitle2 text-weight-medium">{{ book.title }}</div>
        <div class="text-caption text-grey-7">{{ book.series || book.author }}</div>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
const emit = defineEmits(['select', 'edit'])

const props = defineProps({
  book: { type: Object, required: true },
})

const imgError = ref(false)

const coverSrc = computed(() => {
  if (!props.book) return null
  const cover = props.book.cover ?? props.book.coverImageUrl
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
  position: relative;
  background-color: #f5f5f5;
  color: #333;
}

.book-card-edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
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

.book-cover-container {
  width: 64px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.book-cover {
  width: 64px;
  height: 80px;
  display: block;
  font-size: 0;
  line-height: 0;
}

.book-cover img {
  width: 64px;
  height: 80px;
  object-fit: cover;
  border-radius: 0;
  display: block;
  margin: 0;
  padding: 0;
}

.book-cover :deep(.q-avatar) {
  width: 64px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
