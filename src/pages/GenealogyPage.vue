<template>
  <div>
    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-9">
        <q-card bordered flat>
          <q-card-section class="row items-center q-col-gutter-md q-pa-md q-pb-sm">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Genealogy Canvas</div>
            </div>
            <div class="col-auto" style="min-width: 250px">
              <q-input
                v-model="searchCharacterText"
                outlined
                dense
                placeholder="Search characters..."
                clearable
              />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div v-for="node in filteredGraphNodes" :key="node.id" class="col-6 col-sm-4">
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

        <div class="q-mt-md">
          <QuickLinksCard title="Quick Jump" :items="quickJumps" @select="onQuickJumpSelect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import EntityDetailView from 'src/components/details/EntityDetailView.vue'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'
import { useBookWorkspaceStore } from 'src/stores/bookWorkspace'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { useRouter } from 'vue-router'

const { books: mockBooks } = createMockLibraryData()
const bookOptions = computed(() => mockBooks)

const workspaceStore = useBookWorkspaceStore()
const selectedBookId = computed({
  get: () => workspaceStore.currentBookId,
  set: (value) => {
    workspaceStore.currentBookId = value
  },
})
const selectedCharacterId = ref(null)
const searchCharacterText = ref('')

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

const filteredGraphNodes = computed(() => {
  const search = searchCharacterText.value.toLowerCase().trim()
  if (!search) {
    return graphNodes.value
  }

  return graphNodes.value.filter((node) => node.label.toLowerCase().includes(search))
})

const selectedCharacter = computed(() => {
  const characters = selectedWorkspace.value?.characters || []
  return characters.find((character) => character.id === selectedCharacterId.value) || null
})

const router = useRouter()

const quickJumps = computed(() => {
  const characters = selectedWorkspace.value?.characters || []
  return characters
    .slice(0, 2)
    .map((c) => ({ id: c.id, type: 'character', label: c.name, icon: 'person' }))
})

function onQuickJumpSelect(item) {
  if (!item) return
  const bookId = selectedBookId.value
  if (bookId) {
    workspaceStore.currentBookId = bookId
    router.push({ path: '/workspace', query: { book: bookId, type: item.type, id: item.id } })
  }
}
</script>
