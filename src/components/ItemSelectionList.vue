<template>
  <q-list :bordered="bordered" :separator="separator" :class="listClass">
    <q-item
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      :clickable="selectable || interactive"
      :active="selectable && selectedIndex === index"
      active-class="bg-primary text-white"
      :class="selectable || interactive ? 'cursor-pointer' : ''"
      @click="selectItem(item, index)"
    >
      <q-item-section>{{ getItemLabel(item) }}</q-item-section>
      <q-item-section v-if="sideKey && isObjectItem(item)" side>
        {{ getItemSide(item) }}
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  bordered: { type: Boolean, default: false },
  separator: { type: Boolean, default: true },
  listClass: { type: String, default: '' },
  labelKey: { type: String, default: '' },
  sideKey: { type: String, default: '' },
  selectable: { type: Boolean, default: true },
  interactive: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const selectedIndex = ref(-1)

watch(
  () => props.items,
  () => {
    selectedIndex.value = -1
  },
)

function isObjectItem(item) {
  return item !== null && typeof item === 'object'
}

function getItemKey(item, index) {
  if (isObjectItem(item)) {
    return item.id || item.email || item.key || index
  }
  return `${item}-${index}`
}

function getItemLabel(item) {
  if (isObjectItem(item)) {
    if (props.labelKey) {
      return item[props.labelKey] ?? ''
    }
    return item.label ?? item.name ?? item.title ?? ''
  }

  return String(item)
}

function getItemSide(item) {
  if (!isObjectItem(item) || !props.sideKey) {
    return ''
  }
  return item[props.sideKey] ?? ''
}

function selectItem(item, index) {
  if (!props.selectable && !props.interactive) {
    return
  }

  if (props.selectable) {
    selectedIndex.value = index
  }

  emit('select', item)
}
</script>
