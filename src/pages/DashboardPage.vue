<template>
  <div>
    <div class="row q-col-gutter-md items-center q-mb-md">
      <BookSearch v-model="searchQuery" />
    </div>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-lg-9">
        <q-card bordered flat>
          <q-card-section class="row items-center justify-between q-pa-md q-pb-sm">
            <div class="text-subtitle1 text-weight-medium">Library Book Grid</div>
            <q-btn
              unelevated
              color="primary"
              size="sm"
              icon="add"
              label="New Book"
              @click="openNewBook"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <BookGrid :books="filteredBooks" @select="openWorkspace" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-3">
        <QuickLinksCard
          title="Quick Resume"
          :items="recentEdits"
          list-class="q-pa-none"
          @select="onQuickResumeSelect"
        />
      </div>
    </div>

    <GoogleBooksSearchModal v-model="googleBooksOpen" @select="onBookSelected" />
    <NewBookModal v-model="newBookOpen" :prepopulate="prepopulatedBook" @save="addBook" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import GoogleBooksSearchModal from 'src/components/GoogleBooksSearchModal.vue'
import NewBookModal from 'src/components/NewBookModal.vue'
import BookGrid from 'src/components/BookGrid.vue'
import BookSearch from 'src/components/BookSearch.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { createMockLibraryData } from 'src/data/mockLibraryData'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'

const { books: defaultBooks } = createMockLibraryData()
const router = useRouter()
const bookWorkspaceStore = useBookWorkspaceStore()

const books = ref(
  defaultBooks.map((book) => ({
    ...book,
  })),
)

const searchQuery = ref('')
const googleBooksOpen = ref(false)
const newBookOpen = ref(false)
const prepopulatedBook = ref(null)

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

const recentEdits = defaultBooks.slice(0, 3).map((book) => ({
  id: book.id,
  type: 'book',
  label: `Recent edit: ${book.title}`,
}))

function openNewBook() {
  prepopulatedBook.value = null
  googleBooksOpen.value = true
}

function onBookSelected(bookData) {
  prepopulatedBook.value = bookData
  newBookOpen.value = true
}

function openWorkspace(book) {
  if (!book?.id) {
    return
  }

  bookWorkspaceStore.currentBookId = book.id
  router.push('/workspace')
}

function onQuickResumeSelect(item) {
  if (!item) return
  const bookId = item.id
  if (!bookId) return
  bookWorkspaceStore.currentBookId = bookId
  router.push({ path: '/workspace', query: { book: bookId } })
}

function addBook(book) {
  books.value.push({
    ...book,
    cover: book.cover || String(books.value.length + 1).padStart(2, '0'),
  })
  prepopulatedBook.value = null
}
</script>
