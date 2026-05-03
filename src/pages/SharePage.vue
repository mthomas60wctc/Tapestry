<template>
  <div class="row q-col-gutter-md items-stretch">
    <div class="col-12 col-md-8">
      <q-card bordered flat>
        <q-card-section class="text-subtitle1 text-weight-medium">Share Controls</q-card-section>
        <q-separator />
        <q-list separator>
          <q-item v-for="item in shareControls" :key="item">
            <q-item-section>{{ item }}</q-item-section>
          </q-item>
        </q-list>
        <q-card-actions align="right">
          <q-btn unelevated color="primary" label="Save Sharing Settings" />
        </q-card-actions>
      </q-card>
    </div>

    <div class="col-12 col-md-4">
      <q-card bordered flat>
        <q-card-section class="text-subtitle1 text-weight-medium">Collaborators</q-card-section>
        <q-separator />
        <q-list separator>
          <q-item v-for="person in collaborators" :key="person.email">
            <q-item-section>{{ person.email }}</q-item-section>
            <q-item-section side>{{ person.role }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup>
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
