<template>
  <q-select
    outlined
    dense
    clearable
    use-input
    input-debounce="200"
    :options="filteredOptions"
    :model-value="modelValue"
    @update:model-value="onUpdate"
    @filter="onFilter"
    :option-label="optionLabel"
    :option-value="optionValue"
    label="Select book"
    emit-value
    map-options
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: null },
  items: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'title' },
  optionValue: { type: String, default: 'id' },
})

const emit = defineEmits(['update:modelValue'])

const options = computed(() => {
  return props.items.map((it) => ({ ...it }))
})

const filteredOptions = ref([])

watch(
  options,
  (newOptions) => {
    filteredOptions.value = newOptions
  },
  { immediate: true },
)

function onUpdate(val) {
  emit('update:modelValue', val)
}

function onFilter(val, update) {
  const q = String(val || '')
    .trim()
    .toLowerCase()

  update(() => {
    if (!q) {
      filteredOptions.value = options.value
      return
    }

    filteredOptions.value = options.value.filter((it) => {
      return [props.optionLabel, 'author', 'series', 'genre']
        .filter(Boolean)
        .some((k) => (it[k] || '').toString().toLowerCase().includes(q))
    })
  })
}
</script>
