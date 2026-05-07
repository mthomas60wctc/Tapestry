<template>
  <div>
    <div class="row q-col-gutter-md items-center q-mb-md">
      <div class="col-12 col-md-7">
        <WorkspaceSearch v-model="selectedBookId" :items="bookOptions" />
      </div>
    </div>

    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12 col-md-8">
        <q-card bordered flat class="interactive-card q-hoverable cursor-pointer">
          <q-card-section class="text-subtitle1 text-weight-medium">Share Controls</q-card-section>
          <q-separator />
          <ItemSelectionList :items="shareControls" :interactive="true" />
          <q-card-actions align="right">
            <q-btn unelevated color="primary" label="Save Sharing Settings" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <QuickLinksCard
          title="Collaborators"
          :items="collaborators"
          label-key="email"
          side-key="role"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import WorkspaceSearch from 'src/components/WorkspaceSearch.vue'
import ItemSelectionList from 'src/components/ItemSelectionList.vue'
import QuickLinksCard from 'src/components/QuickLinksCard.vue'
import { createMockLibraryData } from 'src/data/mockLibraryData'

const { books: mockBooks } = createMockLibraryData()

const selectedBookId = ref(null)

const bookOptions = computed(() => mockBooks)

const shareControls = [
  'Project visibility: Private / Shared / Public read-only',
  'Generate invite link',
  'Revoke link',
  'Add collaborator (viewer/editor)',
]

const collaborators = [
  { email: 'user1@email.com', role: 'Editor' },
  { email: 'user2@email.com', role: 'Viewer' },
]
</script>
