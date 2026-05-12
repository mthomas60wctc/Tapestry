<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar color="primary" rounded size="40px">TP</q-avatar>
        <div class="column q-ml-sm">
          <div class="text-subtitle1 text-weight-bold">Tapestry</div>
          <div class="text-caption text-white-7">
            Story tracking for readers who lose the thread
          </div>
        </div>

        <q-space />

        <q-btn
          flat
          dense
          round
          :icon="isDarkMode ? 'dark_mode' : 'light_mode'"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDarkMode"
        />

        <q-chip color="accent" text-color="white" icon="account_circle">Account</q-chip>
      </q-toolbar>

      <div class="q-px-md q-pb-sm q-pt-xs row items-center">
        <q-btn flat dense no-caps class="text-left" style="min-width: 160px">
          <div class="text-subtitle2 text-weight-bold">{{ currentBookTitle }}</div>
          <q-menu anchor="bottom left" self="top left">
            <q-list style="min-width: 250px">
              <q-item
                v-for="book in bookOptions"
                :key="book.id"
                clickable
                v-close-popup
                :active="book.id === selectedBookId"
                active-class="bg-primary text-white"
                @click="selectedBookId = book.id"
              >
                <q-item-section>
                  <q-item-label>{{ book.title }}</q-item-label>
                  <q-item-label caption>{{ book.author }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-separator vertical />
        <q-tabs dense align="left" narrow-indicator>
          <q-route-tab to="/dashboard" label="Dashboard" exact />
          <q-route-tab to="/workspace" label="Workspace" />
          <q-route-tab to="/timeline" label="Timeline" />
          <q-route-tab to="/genealogy" label="Genealogy" />
          <q-route-tab to="/share" label="Share" />
        </q-tabs>
      </div>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <q-page class="q-pa-md">
          <div class="q-mx-auto" style="max-width: 1320px">
            <div class="text-h6 q-mb-md">{{ route.meta.viewTitle }}</div>
            <component :is="Component" />
          </div>
        </q-page>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'
import { createMockLibraryData } from 'src/data/mockLibraryData'

const $q = useQuasar()
const darkMode = ref(false)
const bookStore = useBookLibraryStore()
const workspaceStore = useBookWorkspaceStore()

const { books: mockBooks } = createMockLibraryData()

const bookOptions = computed(() => {
  const userBooks = bookStore.userBooks || []
  if (userBooks.length) return userBooks
  return mockBooks
})

const selectedBookId = computed({
  get: () => workspaceStore.currentBookId,
  set: (value) => {
    workspaceStore.currentBookId = value
  },
})

const currentBookTitle = computed(() => {
  const currentBook = bookOptions.value.find((book) => book.id === selectedBookId.value)
  return currentBook?.title || 'Select Book'
})

const isDarkMode = computed(() => darkMode.value)

function applyDarkMode(enabled) {
  darkMode.value = enabled
  $q.dark.set(enabled)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('tapestry-dark-mode', String(enabled))
  }
}

function toggleDarkMode() {
  applyDarkMode(!darkMode.value)
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  // Initialize book if not set
  if (!selectedBookId.value && bookOptions.value.length) {
    selectedBookId.value = bookOptions.value[0].id
  }

  const storedValue = window.localStorage.getItem('tapestry-dark-mode')
  if (storedValue !== null) {
    applyDarkMode(storedValue === 'true')
    return
  }

  applyDarkMode($q.dark.isActive)
})

watch(darkMode, (enabled) => {
  $q.dark.set(enabled)
})
</script>
