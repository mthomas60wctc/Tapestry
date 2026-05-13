<template>
  <q-dialog v-model="dialogModel" @hide="onDialogHide">
    <q-card style="min-width: min(92vw, 820px)">
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
              <q-select
                v-model="form.parentSettingId"
                :options="parentSettingOptions"
                label="Parent Location"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
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
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn v-if="isEditing" flat label="Delete" color="negative" @click="onDelete" />
        <div class="col" />
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          :label="isEditing ? 'Save Changes' : 'Create Location'"
          color="primary"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

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
  characterOptions: {
    type: Array,
    default: () => [],
  },
  parentSettingOptions: {
    type: Array,
    default: () => [],
  },
  tagOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const formRef = ref(null)

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.entity)

const form = reactive(createEmptyForm())

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
    relatedCharacterIds: [],
    parentSettingId: null,
    imageUrl: '',
    tags: [],
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
    relatedCharacterIds: [...(entity.relatedCharacterIds || [])],
    parentSettingId: entity.parentSettingId || null,
    imageUrl: entity.imageUrl || '',
    tags: [...(entity.tags || [])],
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

  emit('save', {
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
    relatedCharacterIds: [...form.relatedCharacterIds],
    parentSettingId: form.parentSettingId || null,
    imageUrl: form.imageUrl.trim() || null,
    tags: [...form.tags],
    createdAt: entity.createdAt || now,
    updatedAt: now,
  })

  dialogModel.value = false
}

function onDelete() {
  emit('delete', props.entity?.id)
  dialogModel.value = false
}
</script>
