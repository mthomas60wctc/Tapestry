<template>
  <q-page class="flex flex-center q-pa-xl">
    <q-card bordered flat style="max-width: 480px; width: 100%">
      <q-card-section class="text-center">
        <q-icon name="error_outline" size="56px" color="primary" class="q-mb-md" />
        <div class="text-h6 q-mb-sm">Page not found</div>
        <div class="text-body2 text-grey-7">The page you requested does not exist.</div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn to="/dashboard" color="primary" unelevated label="Go to Dashboard" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>
