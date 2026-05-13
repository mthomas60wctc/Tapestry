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

        <q-chip
          color="accent"
          text-color="white"
          icon="account_circle"
          clickable
          @click="showLogoutDialog = true"
        >
          {{ accountName }}
        </q-chip>
      </q-toolbar>

      <div class="q-px-md q-pb-sm q-pt-xs row items-center no-wrap nav-strip">
        <div class="book-area row items-center no-wrap">
          <q-btn flat dense no-caps class="text-left book-selector">
            <div class="text-caption text-weight-medium nav-tab-text">{{ currentBookTitle }}</div>
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
          <q-separator vertical class="q-ml-md" />
        </div>
        <q-tabs dense align="center" narrow-indicator class="nav-tabs">
          <q-route-tab to="/dashboard" label="Dashboard" exact />
          <q-route-tab to="/workspace" label="Workspace" />
          <q-route-tab to="/timeline" label="Timeline" />
          <q-route-tab to="/genealogy" label="Genealogy" />
          <q-route-tab to="/share" label="Share" />
        </q-tabs>
      </div>

      <q-dialog v-model="showLogoutDialog">
        <q-card class="logout-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Sign out?</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="text-body1">
              Sign out <strong>{{ accountName }}</strong> from Tapestry?
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn color="negative" label="Sign out" @click="confirmLogout" />
          </q-card-actions>
        </q-card>
      </q-dialog>
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
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from 'boot/firebaseInit'
import { useBookLibraryStore } from 'src/stores/bookLibrary'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'

const $q = useQuasar()
const darkMode = ref(false)
const accountName = ref('Account')
const showLogoutDialog = ref(false)
const bookStore = useBookLibraryStore()
const workspaceStore = useBookWorkspaceStore()

const bookOptions = computed(() => {
  return bookStore.userBooks || []
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

function getFallbackUserName(user) {
  const emailPrefix = user?.email?.split('@')[0]
  return emailPrefix || 'Account'
}

onAuthStateChanged(auth, async (user) => {
  accountName.value = user?.displayName?.trim() || getFallbackUserName(user)

  if (user?.uid) {
    bookStore.initializeLibrary(user.uid)
    await bookStore.loadUserBooks()
    return
  }

  bookStore.reset()
  workspaceStore.reset()
})

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

async function confirmLogout() {
  showLogoutDialog.value = false
  await signOut(auth)
  window.location.reload()
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
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

watch(
  bookOptions,
  (books) => {
    if (!books.length) {
      selectedBookId.value = null
      return
    }

    if (!books.some((book) => book.id === selectedBookId.value)) {
      selectedBookId.value = books[0].id
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.nav-strip {
  position: relative;
  min-height: 48px;
}

.book-area {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.nav-tabs {
  width: 100%;
  justify-content: center;
}

.book-selector,
.nav-tab-text {
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.book-selector {
  min-width: 160px;
}

.nav-tab-text {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.logout-card {
  width: 100%;
  max-width: 420px;
}
</style>
