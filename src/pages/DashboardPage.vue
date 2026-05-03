<template>
  <div class="q-gutter-md">
    <q-card flat>
      <q-card-section class="q-pa-md">
        <q-input
          class="full-width"
          outlined
          dense
          clearable
          label="Search books / notes"
          prepend-icon="search"
        />
      </q-card-section>
    </q-card>

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
            <div class="row q-col-gutter-sm">
              <div v-for="book in books" :key="book.id" class="col-12 col-sm-6 col-md-4">
                <q-card bordered class="full-height">
                  <q-card-section class="row no-wrap items-start q-gutter-sm q-pa-md">
                    <q-avatar color="primary" text-color="white" size="44px">
                      {{ book.cover }}
                    </q-avatar>
                    <div>
                      <div class="text-subtitle2 text-weight-medium">{{ book.title }}</div>
                      <div class="text-caption text-grey-7">{{ book.series || book.author }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
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
import { ref } from 'vue'
import { ModelFactory } from 'src/models'
import NewBookModal from 'src/components/NewBookModal.vue'

const defaultBooks = [
  ModelFactory.createBook({
    id: 'book-001',
    title: 'A Game of Thrones',
    author: 'George R. R. Martin',
    series: 'A Song of Ice and Fire',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'completed',
  }),
  ModelFactory.createBook({
    id: 'book-002',
    title: 'The Fellowship of the Ring',
    author: 'J. R. R. Tolkien',
    series: 'The Lord of the Rings',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'completed',
  }),
  ModelFactory.createBook({
    id: 'book-003',
    title: 'Mistborn',
    author: 'Brandon Sanderson',
    series: 'The Final Empire',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'in-progress',
  }),
  ModelFactory.createBook({
    id: 'book-004',
    title: 'Dune',
    author: 'Frank Herbert',
    series: 'Dune Saga',
    seriesOrder: 1,
    genre: 'Science Fiction',
    status: 'planning',
  }),
  ModelFactory.createBook({
    id: 'book-005',
    title: 'The Foundation',
    author: 'Isaac Asimov',
    series: 'Foundation Series',
    seriesOrder: 1,
    genre: 'Science Fiction',
    status: 'completed',
  }),
  ModelFactory.createBook({
    id: 'book-006',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    series: 'Kingkiller Chronicle',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'in-progress',
  }),
]

const books = ref(
  defaultBooks.map((book, index) => ({
    ...book,
    cover: String(index + 1).padStart(2, '0'),
  })),
)

const recentEdits = defaultBooks.slice(0, 3).map((book) => `Recent edit: ${book.title}`)

const newBookOpen = ref(false)

function addBook(book) {
  books.value.push({
    ...book,
    cover: String(books.value.length + 1).padStart(2, '0'),
  })
}
</script>
