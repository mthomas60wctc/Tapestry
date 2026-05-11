<template>
  <q-card bordered flat class="interactive-card q-hoverable cursor-pointer">
    <q-card-section class="text-subtitle1 text-weight-medium">{{ title }}</q-card-section>
    <q-separator />
    <ItemSelectionList
      :items="items"
      :selectable="false"
      :interactive="true"
      :list-class="listClass"
      :label-key="labelKey"
      :side-key="sideKey"
      @select="onSelect"
    />
  </q-card>
</template>

<script setup>
import ItemSelectionList from 'src/components/ItemSelectionList.vue'

const emit = defineEmits(['select'])

function onSelect(item) {
  emit('select', item)
}

defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  listClass: { type: String, default: '' },
  labelKey: { type: String, default: undefined },
  sideKey: { type: String, default: undefined },
})
</script>
