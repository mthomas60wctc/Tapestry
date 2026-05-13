<template>
  <q-dialog v-model="dialogModel" @hide="onDialogHide">
    <q-card style="min-width: min(92vw, 900px)">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Location' : 'Add Location' }}</div>
        <div class="text-caption text-grey-7">
          Keep the setting details organized for story planning.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Name"
                outlined
                dense
                lazy-rules
                :rules="[(value) => !!value || 'Name is required']"
                hide-bottom-space
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.type" label="Type" outlined dense />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.aliasesText"
                label="Aliases"
                type="textarea"
                autogrow
                outlined
                hide-bottom-space
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.description"
                label="Description"
                type="textarea"
                autogrow
                outlined
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.geography"
                label="Geography"
                type="textarea"
                autogrow
                outlined
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.climate" label="Climate" outlined dense />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.population" label="Population" outlined dense type="number" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.ruler" label="Ruler" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.firstAppearance" label="First Appearance" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.imageUrl" label="Image URL" outlined dense />
            </div>
            <div class="col-12">
              <q-select
                v-model="form.tags"
                use-input
                use-chips
                multiple
                input-debounce="0"
                label="Tags"
                new-value-mode="add"
                :options="options"
                @filter="filterFn"
                outlined
                dense
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"> No results </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Related Entities</div>
            <div class="row q-col-gutter-md q-mb-sm">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.relatedCharacterIds"
                  :options="characterOptions"
                  label="Related Characters"
                  outlined
                  dense
                  multiple
                  use-chips
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.relatedEventIds"
                  :options="eventOptions"
                  label="Related Events"
                  outlined
                  dense
                  multiple
                  use-chips
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.relatedSettingIds"
                  :options="settingOptions"
                  label="Related Settings"
                  outlined
                  dense
                  multiple
                  use-chips
                  emit-value
                  map-options
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn v-if="isEditing" flat label="Delete" color="negative" @click="onDelete" />
        <div class="col" />
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn :label="submitLabel" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <RelationshipDetailsModal
    v-model="relationshipModalOpen"
    source-type="setting"
    :related-drafts="relationshipDrafts"
    @save="finalizeSave"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import RelationshipDetailsModal from 'src/components/RelationshipDetailsModal.vue'
import {
  buildRelationshipPayloads,
  collectRelationshipDrafts,
  collectSelectedRelationshipDrafts,
  getEntityOptions,
} from 'src/utils/relationshipForm'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  entity: {
    type: Object,
    default: null,
  },
  bookId: {
    type: String,
    default: null,
  },
  workspace: {
    type: Object,
    default: null,
  },
  tagOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const formRef = ref(null)
const relationshipModalOpen = ref(false)
const pendingEntity = ref(null)
const relationshipDrafts = ref([])

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.entity)

const form = reactive(createEmptyForm())

const characterOptions = computed(() =>
  getEntityOptions(props.workspace, 'character', props.entity?.id),
)
const eventOptions = computed(() => getEntityOptions(props.workspace, 'event', props.entity?.id))
const settingOptions = computed(() =>
  getEntityOptions(props.workspace, 'setting', props.entity?.id),
)

const hasRelatedSelections = computed(
  () =>
    form.relatedCharacterIds.length || form.relatedEventIds.length || form.relatedSettingIds.length,
)

const submitLabel = computed(() => {
  if (hasRelatedSelections.value) {
    return 'Next'
  }
  return isEditing.value ? 'Save Changes' : 'Create Location'
})

let options = ref(props.tagOptions)

watch(
  () => props.tagOptions,
  (newTags) => {
    options.value = newTags
  },
)

function filterFn(val, update) {
  if (val === '') {
    update(() => {
      options.value = props.tagOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    options.value = props.tagOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  },
)

function createEmptyForm() {
  return {
    name: '',
    aliasesText: '',
    type: '',
    description: '',
    geography: '',
    climate: '',
    population: '',
    ruler: '',
    firstAppearance: '',
    imageUrl: '',
    tags: [],
    relatedCharacterIds: [],
    relatedEventIds: [],
    relatedSettingIds: [],
  }
}

function toText(list) {
  return Array.isArray(list) ? list.filter(Boolean).join(', ') : ''
}

function toList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function resetForm() {
  const entity = props.entity || {}
  const relatedDrafts = collectRelationshipDrafts(props.workspace, entity, 'setting', [
    'character',
    'event',
    'setting',
  ])

  Object.assign(form, createEmptyForm(), {
    name: entity.name || '',
    aliasesText: toText(entity.aliases),
    type: entity.type || '',
    description: entity.description || '',
    geography: entity.geography || '',
    climate: entity.climate || '',
    population: entity.population ?? '',
    ruler: entity.ruler || '',
    firstAppearance: entity.firstAppearance || '',
    imageUrl: entity.imageUrl || '',
    tags: [...(entity.tags || [])],
    relatedCharacterIds: relatedDrafts
      .filter((draft) => draft.targetType === 'character')
      .map((draft) => draft.targetId),
    relatedEventIds: relatedDrafts
      .filter((draft) => draft.targetType === 'event')
      .map((draft) => draft.targetId),
    relatedSettingIds: relatedDrafts
      .filter((draft) => draft.targetType === 'setting')
      .map((draft) => draft.targetId),
  })
}

function onDialogHide() {
  formRef.value?.resetValidation?.()
}

async function save() {
  const valid = await formRef.value?.validate?.()
  if (valid === false) {
    return
  }

  const now = new Date()
  const entity = props.entity || {}
  const baseEntity = {
    ...entity,
    id: entity.id || globalThis.crypto?.randomUUID?.() || `setting-${Date.now()}`,
    bookId: entity.bookId || props.bookId,
    name: form.name.trim(),
    aliases: toList(form.aliasesText),
    type: form.type.trim(),
    description: form.description.trim(),
    geography: form.geography.trim(),
    climate: form.climate.trim(),
    population: toNumber(form.population),
    ruler: form.ruler.trim(),
    firstAppearance: form.firstAppearance.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
    tags: [...form.tags],
    createdAt: entity.createdAt || now,
    updatedAt: now,
  }

  const relatedDrafts = collectSelectedRelationshipDrafts(props.workspace, baseEntity, 'setting', {
    character: form.relatedCharacterIds,
    event: form.relatedEventIds,
    setting: form.relatedSettingIds,
  })

  if (relatedDrafts.length) {
    pendingEntity.value = baseEntity
    relationshipDrafts.value = relatedDrafts
    relationshipModalOpen.value = true
    return
  }

  emit('save', {
    entity: baseEntity,
    relationships: buildRelationshipPayloads(baseEntity, 'setting', []),
  })
  dialogModel.value = false
}

function finalizeSave(drafts) {
  if (!pendingEntity.value) {
    return
  }

  emit('save', {
    entity: pendingEntity.value,
    relationships: buildRelationshipPayloads(pendingEntity.value, 'setting', drafts),
  })

  pendingEntity.value = null
  relationshipDrafts.value = []
  dialogModel.value = false
}

function onDelete() {
  emit('delete', props.entity?.id)
  dialogModel.value = false
}
</script>
