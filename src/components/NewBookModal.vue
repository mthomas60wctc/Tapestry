<template>
  <q-dialog v-model="dialogModel">
    <q-card style="min-width: 600px; max-width: 900px">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Book' : 'New Book Details' }}</div>
        <div class="text-caption text-grey-7">Complete your book information</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <q-form ref="formRef">
          <div class="row q-col-gutter-md">
            <!-- Cover Image Section -->
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 q-mb-md">Book Cover</div>
              <div
                class="bg-grey-2 rounded-borders"
                style="
                  aspect-ratio: 2 / 3;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 250px;
                "
              >
                <div v-if="!form.cover && !coverPreview" class="text-center">
                  <q-icon name="image" size="56px" color="grey-5" />
                  <div class="text-caption text-grey-6 q-mt-sm">No cover image</div>
                </div>
                <img
                  v-else
                  :src="coverPreview || form.cover"
                  alt="Book cover preview"
                  style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px"
                />
              </div>

              <div class="q-gutter-md q-mt-md">
                <div>
                  <q-input
                    v-model="form.cover"
                    outlined
                    dense
                    label="Cover Image URL"
                    type="url"
                    placeholder="https://..."
                    @update:model-value="handleCoverUrlChange"
                  />
                </div>
                <div class="text-center text-grey-7 text-caption">or</div>
                <q-file
                  ref="fileInputRef"
                  v-model="coverFile"
                  outlined
                  dense
                  label="Upload Image"
                  accept="image/*"
                  max-file-size="5242880"
                  @update:model-value="handleCoverFileChange"
                />
              </div>
            </div>

            <!-- Form Fields -->
            <div class="col-12 col-md-8">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="form.title"
                    outlined
                    dense
                    label="Title *"
                    required
                    :rules="[(val) => !!val || 'Title is required']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.author"
                    outlined
                    dense
                    label="Author *"
                    required
                    :rules="[(val) => !!val || 'Author is required']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.series" outlined dense label="Series" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.genre" outlined dense label="Genre" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="form.status"
                    :options="statusOptions"
                    outlined
                    dense
                    label="Status *"
                    required
                    :rules="[(val) => !!val || 'Status is required']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="form.visibility"
                    :options="visibilityOptions"
                    outlined
                    dense
                    label="Visibility *"
                    required
                    :rules="[(val) => !!val || 'Visibility is required']"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.description"
                    outlined
                    label="Description"
                    type="textarea"
                    autogrow
                  />
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn v-if="isEditing" flat color="negative" label="Delete" @click="onDelete" />
        <q-btn :label="submitLabel" color="primary" unelevated @click="saveBook" />
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
  prepopulate: {
    type: Object,
    default: null,
  },
  // When provided, the modal becomes edit-capable for this book
  book: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const formRef = ref(null)
const fileInputRef = ref(null)
const coverFile = ref(null)
const coverPreview = ref('')

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

const isEditing = computed(() => !!props.book)
const submitLabel = computed(() => (isEditing.value ? 'Save Changes' : 'Save Book'))

const form = reactive(createEmptyForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      // If editing an existing book, populate from `book` first
      if (props.book) {
        Object.assign(form, {
          title: props.book.title || '',
          author: props.book.author || '',
          series: props.book.series || '',
          genre: props.book.genre || '',
          status: props.book.status || 'in-progress',
          visibility: props.book.visibility || 'private',
          description: props.book.description || '',
          cover: props.book.cover || props.book.coverImageUrl || '',
        })
        if (props.book.cover || props.book.coverImageUrl) {
          coverPreview.value = props.book.cover || props.book.coverImageUrl || ''
        }
        return
      }

      if (props.prepopulate) {
        Object.assign(form, {
          title: props.prepopulate.title || '',
          author: props.prepopulate.author || '',
          series: props.prepopulate.series || '',
          genre: props.prepopulate.genre || '',
          status: props.prepopulate.status || 'in-progress',
          visibility: props.prepopulate.visibility || 'private',
          description: props.prepopulate.description || '',
          cover: props.prepopulate.coverUrl || '',
        })
        if (props.prepopulate.coverUrl) {
          coverPreview.value = props.prepopulate.coverUrl
        }
      }
    }
  },
)

watch(
  () => props.book,
  (b) => {
    if (!b) return
    if (props.modelValue) {
      Object.assign(form, {
        title: b.title || '',
        author: b.author || '',
        series: b.series || '',
        genre: b.genre || '',
        status: b.status || 'in-progress',
        visibility: b.visibility || 'private',
        description: b.description || '',
        cover: b.cover || b.coverImageUrl || '',
      })
      coverPreview.value = b.cover || b.coverImageUrl || ''
    }
  },
)

function createEmptyForm() {
  return {
    title: '',
    author: '',
    series: '',
    genre: '',
    status: 'in-progress',
    visibility: 'private',
    description: '',
    cover: '',
  }
}

function resetForm() {
  Object.assign(form, createEmptyForm())
  coverFile.value = null
  coverPreview.value = ''
}

function closeDialog() {
  dialogModel.value = false
}

function onDelete() {
  if (!props.book?.id) return
  emit('delete', props.book.id)
  closeDialog()
}

function handleCoverUrlChange() {
  // URL validation happens on blur/submit through the URL input type
  // Attempt to load preview when user stops typing
  if (form.cover && isValidUrl(form.cover)) {
    coverPreview.value = form.cover
  } else {
    coverPreview.value = ''
  }
}

function handleCoverFileChange(file) {
  if (!file) {
    coverPreview.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target?.result || ''
    form.cover = e.target?.result || ''
  }
  reader.readAsDataURL(file)
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
    //eslint-disable-next-line no-unused-vars
  } catch (_) {
    return false
  }
}

async function saveBook() {
  const valid = await formRef.value?.validate?.()
  if (valid === false) {
    return
  }

  const now = new Date()
  const existingBook = props.book || {}
  const book = ModelFactory.createBook({
    id: existingBook.id || globalThis.crypto?.randomUUID?.() || `book-${Date.now()}`,
    title: form.title.trim(),
    author: form.author.trim(),
    series: form.series.trim() || null,
    genre: form.genre.trim(),
    status: form.status,
    visibility: form.visibility,
    description: form.description.trim(),
    cover: form.cover || null,
    createdAt: existingBook.createdAt || now,
    updatedAt: now,
  })

  emit('save', book)
  closeDialog()
  resetForm()
}
</script>
