<template>
  <q-dialog v-model="dialogModel">
    <q-card>
      <q-card-section>
        <div class="text-h6">New Book</div>
        <div class="text-caption text-grey-7">Add a new book to your library to get started</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef">
          <div class="row q-col-gutter-md">
            <div class="col-md-6">
              <q-input v-model="form.title" label="Title" required />
              <q-input v-model="form.author" label="Author" required />
              <q-input v-model="form.series" label="Series" />
            </div>
            <div class="col-md-6">
              <q-input v-model="form.genre" label="Genre" />
              <q-select v-model="form.status" :options="statusOptions" label="Status" required />
              <q-select
                v-model="form.visibility"
                :options="visibilityOptions"
                label="Visibility"
                required
              />
            </div>
          </div>
          <q-input v-model="form.description" label="Description" type="textarea" autogrow />
        </q-form>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn label="Save Book" color="primary" @click="saveBook" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ModelFactory } from 'src/models'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)

const statusOptions = [
  { label: 'In progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Planning', value: 'planning' },
]

const visibilityOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Shared', value: 'shared' },
  { label: 'Public', value: 'public' },
]

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = reactive(createEmptyForm())

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
    title: '',
    author: '',
    series: '',
    genre: '',
    status: 'In-progress',
    visibility: 'Private',
    description: '',
  }
}

function resetForm() {
  Object.assign(form, createEmptyForm())
}

function closeDialog() {
  dialogModel.value = false
}

async function saveBook() {
  const valid = await formRef.value?.validate?.()
  if (valid === false) {
    return
  }

  const now = new Date()
  const book = ModelFactory.createBook({
    id: globalThis.crypto?.randomUUID?.() ?? `book-${Date.now()}`,
    title: form.title.trim(),
    author: form.author.trim(),
    series: form.series.trim() || null,
    genre: form.genre.trim(),
    status: form.status,
    visibility: form.visibility,
    description: form.description.trim(),
    createdAt: now,
    updatedAt: now,
  })

  emit('save', book)
  closeDialog()
  resetForm()
}
</script>
