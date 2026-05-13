<template>
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
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

function onUpdate(val) {
  emit('update:modelValue', val)
}
</script>
