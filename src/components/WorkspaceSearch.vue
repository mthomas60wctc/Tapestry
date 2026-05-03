<template>
  <q-select
    outlined
    dense
    clearable
    use-input
    input-debounce="200"
    :options="options"
    :model-value="modelValue"
    @update:model-value="onUpdate"
    @filter="onFilter"
    :option-label="optionLabel"
    :option-value="optionValue"
    :placeholder="placeholder"
    emit-value
    map-options
  />
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: null },
  items: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'title' },
  optionValue: { type: String, default: 'id' },
  placeholder: { type: String, default: 'Search books...' },
})

const emit = defineEmits(['update:modelValue'])

const internalOptions = ref([])

const options = computed(() => {
  return props.items.map((it) => ({ ...it }))
})

function onUpdate(val) {
  emit('update:modelValue', val)
}

function onFilter(val, update) {
  const q = String(val || '')
    .trim()
    .toLowerCase()
  if (!q) {
    update(options.value)
    return
  }
  const filtered = options.value.filter((it) => {
    return [props.optionLabel, 'author', 'series', 'genre']
      .filter(Boolean)
      .some((k) => (it[k] || '').toString().toLowerCase().includes(q))
  })
  update(filtered)
}
</script>
