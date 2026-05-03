<template>
  <div class="q-gutter-md">
    <BookSearch v-model="searchQuery" />

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-lg-8">
        <q-card bordered flat>
          <q-card-section class="row items-center justify-between q-pa-md q-pb-sm">
            <div class="text-subtitle1 text-weight-medium">Library Book Grid</div>
            <q-btn
              unelevated
              color="primary"
              size="sm"
              icon="add"
              label="New Book"
              @click="newBookOpen = true"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <BookGrid :books="filteredBooks" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card bordered flat class="full-height">
          <q-card-section class="q-pa-md q-pb-sm text-subtitle1 text-weight-medium">
            Quick Resume
          </q-card-section>
          <q-separator />
          <q-list separator class="q-pa-none">
            <q-item v-for="edit in recentEdits" :key="edit">
              <q-item-section>{{ edit }}</q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn unelevated color="primary" label="+ Add Book / Project" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <NewBookModal v-model="newBookOpen" @save="addBook" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NewBookModal from 'src/components/NewBookModal.vue'
import BookGrid from 'src/components/BookGrid.vue'
import BookSearch from 'src/components/BookSearch.vue'
import { createMockLibraryData } from 'src/data/mockLibraryData'

const { books: defaultBooks } = createMockLibraryData()

const books = ref(
  defaultBooks.map((book) => ({
    ...book,
  })),
)

const searchQuery = ref('')

const filteredBooks = computed(() => {
  const q = String(searchQuery.value || '')
    .trim()
    .toLowerCase()
  if (!q) return books.value
  return books.value.filter((b) => {
    return [b.title, b.author, b.series, b.genre, b.status]
      .filter(Boolean)
      .some((f) => String(f).toLowerCase().includes(q))
  })
})

const recentEdits = defaultBooks.slice(0, 3).map((book) => `Recent edit: ${book.title}`)

const newBookOpen = ref(false)

function addBook(book) {
  books.value.push({
    ...book,
    cover: String(books.value.length + 1).padStart(2, '0'),
  })
}
</script>
