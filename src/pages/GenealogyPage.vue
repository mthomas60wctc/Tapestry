<template>
  <div class="row q-col-gutter-md items-stretch">
    <div class="col-12 col-md-3">
      <q-card bordered flat>
        <q-card-section class="text-subtitle1 text-weight-medium">Graph Controls</q-card-section>
        <q-separator />
        <q-list separator>
          <q-item v-for="control in graphControls" :key="control">
            <q-item-section>{{ control }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <div class="col-12 col-md-6">
      <q-card bordered flat>
        <q-card-section class="text-subtitle1 text-weight-medium">Genealogy Canvas</q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div v-for="node in graphNodes" :key="node.id" class="col-6 col-sm-4">
              <q-card bordered>
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
        <q-list separator>
          <q-item v-for="detail in nodeDetails" :key="detail">
            <q-item-section>{{ detail }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createMockLibraryData, getMockWorkspaceData } from 'src/data/mockLibraryData'

const graphControls = [
  'Zoom In / Out',
  'Filter by Node Type',
  'Highlight Neighbors',
  'Cluster by Type',
]

const { books: mockBooks } = createMockLibraryData()
const selectedWorkspace = computed(() => getMockWorkspaceData(mockBooks[0]?.id))

const graphNodes = computed(() => {
  const characters = selectedWorkspace.value?.characters || []

  return characters.map((character) => ({
    id: character.id,
    label: character.name,
  }))
})

const nodeDetails = computed(() => {
  const [character] = selectedWorkspace.value?.characters || []

  if (!character) {
    return ['No character selected']
  }

  return [
    character.name,
    `Role: ${character.role}`,
    character.description,
    `Tags: ${character.tags.join(', ')}`,
  ]
})
</script>
