<template>
  <q-dialog v-model="dialogModel" @hide="onDialogHide">
    <q-card style="min-width: min(96vw, 980px)">
      <q-card-section>
        <div class="text-h6">Relationship Details</div>
        <div class="text-caption text-grey-7">
          Configure the relationship type and details for each related entity.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="drafts.length" class="q-gutter-md">
          <div
            v-for="draft in drafts"
            :key="`${draft.targetType}-${draft.targetId}`"
            class="relation-row q-pa-sm"
          >
            <div class="text-subtitle2 q-mb-sm">
              {{ draft.label }}
              <span class="text-caption text-grey-7">({{ draft.targetType }})</span>
            </div>
            <div class="row q-col-gutter-md items-start">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="draft.relationshipType"
                  :options="getRelationshipOptions(draft.targetType)"
                  label="Relationship Type"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-8">
                <q-input
                  v-model="draft.description"
                  label="Details"
                  type="textarea"
                  autogrow
                  outlined
                  dense
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-grey-7">No related entities were selected.</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Back" color="primary" @click="dialogModel = false" />
        <q-btn color="primary" label="Save" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { getRelationshipTypeOptions } from 'src/utils/relationshipForm'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  sourceType: {
    type: String,
    default: '',
  },
  relatedDrafts: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const drafts = reactive([])

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      drafts.splice(0, drafts.length, ...props.relatedDrafts.map((draft) => ({ ...draft })))
    }
  },
)

function getRelationshipOptions(targetType) {
  return getRelationshipTypeOptions(props.sourceType, targetType)
}

function onDialogHide() {
  // no-op; the parent controls reopening
}

function save() {
  emit(
    'save',
    drafts
      .map((draft) => ({ ...draft }))
      .filter((draft) => draft.targetId && draft.relationshipType),
  )
  dialogModel.value = false
}
</script>

<style scoped>
.relation-row {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}
</style>
