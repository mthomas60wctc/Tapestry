<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar color="primary" text-color="white" rounded size="40px">TP</q-avatar>
        <div class="column q-ml-sm">
          <div class="text-subtitle1 text-weight-bold">Tapestry</div>
          <div class="text-caption text-grey-7">Story tracking for readers and series</div>
        </div>

        <q-space />

        <q-chip outline color="primary" text-color="primary" icon="account_circle">Account</q-chip>
      </q-toolbar>

      <q-separator />

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

<script setup></script>
