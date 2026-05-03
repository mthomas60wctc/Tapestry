<template>
  <q-card flat>
    <q-card-section class="q-pa-md">
      <q-input
        class="full-width"
        outlined
        dense
        clearable
        :model-value="modelValue"
        @update:model-value="onUpdate"
        label="Search books / notes"
        prepend-icon="search"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
function onUpdate(val) {
  emit('update:modelValue', val)
}
</script>
