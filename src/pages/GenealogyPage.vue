<template>
  <div>
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-12 col-md-7">
        <WorkspaceSearch v-model="selectedBookId" :items="bookOptions" />
      </div>
      <div class="col-12 col-md-5">
        <q-chip outline color="primary" icon="groups"> Family / Hierarchy / Links </q-chip>
      </div>
    </div>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-9">
        <q-card bordered flat>
          <q-card-section class="text-subtitle1 text-weight-medium"
            >Genealogy Canvas</q-card-section
          >
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div v-for="node in graphNodes" :key="node.id" class="col-6 col-sm-4">
                <q-card bordered class="cursor-pointer" @click="selectedCharacterId = node.id">
                  <q-card-section class="text-center">
                    <q-avatar color="primary" text-color="white" class="q-mb-sm">{{
                      node.label.charAt(0)
                    }}</q-avatar>
                    <div class="text-subtitle2">{{ node.label }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card bordered flat>
          <q-card-section class="text-subtitle1 text-weight-medium"
            >Selected Node Detail</q-card-section
          >
          <q-separator />
          <EntityDetailView :entity="selectedCharacter" type="character" />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import WorkspaceSearch from 'src/components/WorkspaceSearch.vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'

const { books: mockBooks } = createMockLibraryData()
const bookOptions = computed(() => mockBooks)

const selectedBookId = ref(null)
const selectedCharacterId = ref(null)

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

const selectedWorkspace = computed(() => getMockWorkspaceData(selectedBookId.value))

watch(
  () => selectedWorkspace.value?.characters,
  (characters) => {
    selectedCharacterId.value = characters?.[0]?.id || null
  },
  { immediate: true },
)

const graphNodes = computed(() => {
  const characters = selectedWorkspace.value?.characters || []

  return characters.map((character) => ({
    id: character.id,
    label: character.name,
  }))
})

const selectedCharacter = computed(() => {
  const characters = selectedWorkspace.value?.characters || []
  return characters.find((character) => character.id === selectedCharacterId.value) || null
})
</script>
