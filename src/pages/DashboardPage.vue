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
            <div v-if="bookLibraryStore.isLoading" class="text-center text-grey-7 q-py-xl">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">
                Loading books from Firestore
              </div>
              <div class="text-body2">Waiting for your library to sync.</div>
            </div>
            <div v-else-if="!filteredBooks.length" class="text-center text-grey-7 q-py-xl">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">No books in Firestore yet</div>
              <div class="text-body2">Create a new book or seed Firestore to see it here.</div>
            </div>
            <BookGrid v-else :books="filteredBooks" @select="openWorkspace" />
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import GoogleBooksSearchModal from 'src/components/GoogleBooksSearchModal.vue'
import NewBookModal from 'src/components/NewBookModal.vue'
import BookGrid from 'src/components/BookGrid.vue'
import BookSearch from 'src/components/BookSearch.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'
const router = useRouter()
const bookWorkspaceStore = useBookWorkspaceStore()
const bookLibraryStore = useBookLibraryStore()

const books = computed(() => {
  return bookLibraryStore.userBooks || []
})

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

const recentEdits = computed(() =>
  books.value.slice(0, 3).map((book) => ({
    id: book.id,
    type: 'book',
    label: `Recent edit: ${book.title}`,
  })),
)

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
  void bookLibraryStore.addBook({
    ...book,
    cover: book.cover || String(books.value.length + 1).padStart(2, '0'),
  })
  prepopulatedBook.value = null
}
</script>
