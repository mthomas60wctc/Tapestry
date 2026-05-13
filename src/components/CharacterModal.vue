<template>
  <q-dialog v-model="dialogModel" @hide="onDialogHide">
    <q-card style="min-width: min(92vw, 720px)">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Character' : 'Add Character' }}</div>
        <div class="text-caption text-grey-7">Update the core character details for this book.</div>
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
              <q-input v-model="form.firstAppearance" label="First Appearance" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.role"
                :options="roleOptions"
                label="Role"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                emit-value
                map-options
              />
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
                v-model="form.background"
                label="Background"
                type="textarea"
                autogrow
                outlined
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.imageUrl" label="Image URL" outlined dense />
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
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          :label="isEditing ? 'Save Changes' : 'Create Character'"
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
  tagOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Deceased', value: 'deceased' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Retired', value: 'retired' },
]

const roleOptions = [
  { label: 'Protagonist', value: 'protagonist' },
  { label: 'Antagonist', value: 'antagonist' },
  { label: 'Supporting', value: 'supporting' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Love Interest', value: 'love-interest' },
]

let tagSelectOptions = ref(props.tagOptions)

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.entity)

const form = reactive(createEmptyForm())

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
    name: '',
    aliasesText: '',
    status: 'active',
    role: 'supporting',
    description: '',
    firstAppearance: '',
    background: '',
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

function resetForm() {
  const entity = props.entity || {}
  Object.assign(form, createEmptyForm(), {
    name: entity.name || '',
    aliasesText: toText(entity.aliases),
    status: entity.status || 'active',
    role: entity.role || 'supporting',
    description: entity.description || '',
    firstAppearance: entity.firstAppearance || '',
    background: entity.background || '',
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
    id: entity.id || globalThis.crypto?.randomUUID?.() || `character-${Date.now()}`,
    bookId: entity.bookId || props.bookId,
    name: form.name.trim(),
    aliases: toList(form.aliasesText),
    status: form.status,
    role: form.role,
    description: form.description.trim(),
    firstAppearance: form.firstAppearance.trim() || null,
    background: form.background.trim(),
    imageUrl: form.imageUrl.trim() || null,
    tags: [...form.tags],
    createdAt: entity.createdAt || now,
    updatedAt: now,
  })

  dialogModel.value = false
}
</script>
