<template>
  <q-dialog v-model="dialogModel" @hide="onDialogHide">
    <q-card style="min-width: min(94vw, 900px)">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Event' : 'Add Event' }}</div>
        <div class="text-caption text-grey-7">
          Capture the story beats that connect characters and locations.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.title"
                label="Title"
                outlined
                dense
                lazy-rules
                :rules="[(value) => !!value || 'Title is required']"
                hide-bottom-space
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.chapterTitle" label="Chapter Title" outlined dense />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.chapter" label="Chapter" outlined dense type="number" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.sequenceOrder" label="Sequence" outlined dense type="number" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.pageStart" label="Page Start" outlined dense type="number" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.pageEnd" label="Page End" outlined dense type="number" />
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
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.characterIds"
                :options="characterOptions"
                label="Characters Involved"
                outlined
                dense
                multiple
                use-chips
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.settingIds"
                :options="settingOptions"
                label="Locations Involved"
                outlined
                dense
                multiple
                use-chips
                emit-value
                map-options
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.arc" label="Arc" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.emotionalTone" label="Emotional Tone" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.internalDate" label="Internal Date" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.tags"
                use-input
                use-chips
                multiple
                input-debounce="0"
                label="Tags"
                new-value-mode="add"
                :options="tagSelectOptions"
                @filter="filterTagsFn"
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

          <q-input v-model="form.notes" label="Notes" type="textarea" autogrow outlined />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn v-if="isEditing" flat label="Delete" color="negative" @click="onDelete" />
        <div class="col" />
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn :label="isEditing ? 'Save Changes' : 'Create Event'" color="primary" @click="save" />
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
  settingOptions: {
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

let tagSelectOptions = ref(props.tagOptions)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  },
)

watch(
  () => props.tagOptions,
  (newTags) => {
    tagSelectOptions.value = newTags
  },
)

function filterTagsFn(val, update) {
  if (val === '') {
    update(() => {
      tagSelectOptions.value = props.tagOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    tagSelectOptions.value = props.tagOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

function createEmptyForm() {
  return {
    title: '',
    description: '',
    chapter: '',
    chapterTitle: '',
    pageStart: '',
    pageEnd: '',
    sequenceOrder: '',
    internalDate: '',
    characterIds: [],
    settingIds: [],
    arc: '',
    emotionalTone: '',
    tags: [],
    notes: '',
  }
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
    title: entity.title || '',
    description: entity.description || '',
    chapter: entity.chapter ?? '',
    chapterTitle: entity.chapterTitle || '',
    pageStart: entity.pageStart ?? '',
    pageEnd: entity.pageEnd ?? '',
    sequenceOrder: entity.sequenceOrder ?? '',
    internalDate: entity.internalDate || '',
    characterIds: [...(entity.characterIds || [])],
    settingIds: [...(entity.settingIds || [])],
    arc: entity.arc || '',
    emotionalTone: entity.emotionalTone || '',
    tags: [...(entity.tags || [])],
    notes: entity.notes || '',
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
    id: entity.id || globalThis.crypto?.randomUUID?.() || `event-${Date.now()}`,
    bookId: entity.bookId || props.bookId,
    title: form.title.trim(),
    description: form.description.trim(),
    chapter: toNumber(form.chapter),
    chapterTitle: form.chapterTitle.trim(),
    pageStart: toNumber(form.pageStart),
    pageEnd: toNumber(form.pageEnd),
    sequenceOrder: toNumber(form.sequenceOrder) ?? 0,
    internalDate: form.internalDate.trim() || null,
    characterIds: [...form.characterIds],
    settingIds: [...form.settingIds],
    arc: form.arc.trim(),
    emotionalTone: form.emotionalTone.trim(),
    tags: [...form.tags],
    notes: form.notes.trim(),
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
