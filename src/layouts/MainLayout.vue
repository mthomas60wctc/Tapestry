<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar color="primary" text-color="white" rounded size="40px">TP</q-avatar>
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

        <q-chip color="accent" icon="account_circle">Account</q-chip>
      </q-toolbar>

      <div class="q-px-md q-pb-sm q-pt-xs">
        <q-tabs dense align="center" narrow-indicator>
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

const $q = useQuasar()
const darkMode = ref(false)

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
