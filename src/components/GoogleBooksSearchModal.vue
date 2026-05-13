<template>
  <q-dialog v-model="dialogModel" @hide="resetForm">
    <q-card style="min-width: 600px; max-width: 900px">
      <q-card-section>
        <div class="text-h6">Find Book Details</div>
        <div class="text-caption text-grey-7">Search Google Books to populate book details</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <q-form @submit="searchBooks">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="searchForm.title"
                outlined
                dense
                label="Title"
                placeholder="e.g., The Great Gatsby"
                @keyup.enter="searchBooks"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="searchForm.author"
                outlined
                dense
                label="Author"
                placeholder="e.g., F. Scott Fitzgerald"
                @keyup.enter="searchBooks"
              />
            </div>
          </div>
          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn
              unelevated
              label="Search"
              color="primary"
              type="submit"
              :loading="isSearching"
              :disable="!searchForm.title && !searchForm.author"
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Search Results -->
      <q-separator v-if="searchResults.length > 0" />

      <q-card-section v-if="isSearching" class="text-center q-py-lg">
        <q-spinner color="primary" size="40px" />
        <div class="text-body2 q-mt-md">Searching Google Books...</div>
      </q-card-section>

      <q-card-section v-else-if="searchResults.length > 0" class="q-pa-none">
        <q-scroll-area style="height: 400px">
          <div class="q-pa-md">
            <div class="text-subtitle2 q-mb-md">{{ searchResults.length }} results found</div>
            <div class="row q-col-gutter-md">
              <div
                v-for="book in searchResults"
                :key="book.id"
                class="col-12"
                @click="selectBook(book)"
              >
                <q-card flat bordered class="cursor-pointer hover-highlight">
                  <q-card-section class="row q-col-gutter-md">
                    <div v-if="book.imageLinks?.thumbnail" class="col-auto">
                      <img
                        :src="book.imageLinks.thumbnail"
                        alt="Book cover"
                        style="height: 120px; object-fit: cover"
                      />
                    </div>
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">{{ book.title }}</div>
                      <div class="text-body2 text-grey-7">
                        {{ book.authors?.join(', ') || 'Unknown author' }}
                      </div>
                      <div v-if="book.publishedDate" class="text-caption text-grey-6">
                        Published: {{ book.publishedDate }}
                      </div>
                      <div
                        v-if="book.description"
                        class="text-caption q-mt-sm"
                        style="
                          display: -webkit-box;
                          -webkit-line-clamp: 2;
                          -webkit-box-orient: vertical;
                          overflow: hidden;
                        "
                      >
                        {{ book.description }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>

      <q-card-section v-else-if="searchError" class="text-center q-py-lg">
        <div class="text-negative">
          <q-icon name="error" size="xl" />
          <div class="q-mt-md">{{ searchError }}</div>
        </div>
      </q-card-section>

      <q-card-section v-else-if="hasSearched" class="text-center q-py-lg">
        <div class="text-grey-7">
          <q-icon name="search" size="xl" />
          <div class="q-mt-md">No books found. Try different search terms.</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Notify } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const searchForm = reactive({
  title: '',
  author: '',
})

const searchResults = ref([])
const isSearching = ref(false)
const searchError = ref('')
const hasSearched = ref(false)

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || ''
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'
console.log('Using Google Books API Key:', GOOGLE_BOOKS_API_KEY ? 'Yes' : 'No')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  },
)

function resetForm() {
  searchForm.title = ''
  searchForm.author = ''
  searchResults.value = []
  searchError.value = ''
  hasSearched.value = false
}

async function searchBooks() {
  if (!searchForm.title && !searchForm.author) {
    Notify.create({
      type: 'negative',
      message: 'Please enter a title or author',
    })
    return
  }

  isSearching.value = true
  searchError.value = ''
  hasSearched.value = true

  try {
    let query = ''
    if (searchForm.title) {
      query += `intitle:"${searchForm.title}"`
    }
    if (searchForm.author) {
      if (query) query += ' '
      query += `inauthor:"${searchForm.author}"`
    }

    const params = new URLSearchParams({
      // projection: 'lite',
      q: query,
      maxResults: 10,
      printType: 'books',
      ...(GOOGLE_BOOKS_API_KEY && { key: GOOGLE_BOOKS_API_KEY }),
    })

    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`)

    if (!response.ok) {
      console.error('Google Books API error:', response.status, response.statusText)
      throw new Error(
        response.status === 403
          ? 'API limit reached. Please try again later.'
          : 'Failed to search Google Books',
      )
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      searchResults.value = []
      return
    }

    searchResults.value = data.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      authors: item.volumeInfo?.authors || [],
      publishedDate: item.volumeInfo?.publishedDate || null,
      description: item.volumeInfo?.description || '',
      imageLinks: {
        thumbnail:
          item.volumeInfo?.imageLinks?.thumbnail
            ?.replace('http://', 'https://') // Always force HTTPS
            ?.replace('&edge=curl', '') || // Removes the curled page effect
          '',
        smallThumbnail:
          item.volumeInfo?.imageLinks?.smallThumbnail
            ?.replace('http://', 'https://')
            ?.replace('&edge=curl', '') || '',
      },
      canonicalVolumeLink: item.volumeInfo?.canonicalVolumeLink || '',
      genre: item.volumeInfo?.categories?.[0] || '',
      publisher: item.volumeInfo?.publisher || '',
    }))
  } catch (error) {
    console.error('Google Books API error:', error)
    searchError.value = error.message || 'Failed to search books. Please try again.'
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function selectBook(book) {
  emit('select', {
    title: book.title,
    author: book.authors[0] || '',
    genre: book.genre,
    coverUrl: book.imageLinks?.thumbnail || '',
    description: book.description,
    externalLink: book.canonicalVolumeLink,
  })
  dialogModel.value = false
}
</script>

<style scoped>
.hover-highlight:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
