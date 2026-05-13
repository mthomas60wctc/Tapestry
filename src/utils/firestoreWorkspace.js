import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { toRaw } from 'vue'
import { db } from 'boot/firebaseInit'

export function toPlainFirestoreValue(value) {
  if (value === null || value === undefined) {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlainFirestoreValue(item))
  }

  if (typeof value !== 'object') {
    return value
  }

  const rawValue = toRaw(value)

  if (rawValue instanceof Date) {
    return new Date(rawValue.getTime())
  }

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => toPlainFirestoreValue(item))
  }

  const plain = {}
  Object.entries(rawValue).forEach(([key, item]) => {
    if (item !== undefined) {
      plain[key] = toPlainFirestoreValue(item)
    }
  })

  return plain
}

export function cloneWorkspaceData(workspace) {
  if (!workspace) {
    return null
  }

  const cloned = toPlainFirestoreValue(workspace)

  if (cloned.characters) {
    cloned.characters = cloned.characters.map((char) => {
      const cleaned = { ...char }
      delete cleaned.relatedCharacterIds
      delete cleaned.settingIds
      delete cleaned.eventIds
      return cleaned
    })
  }

  if (cloned.events) {
    cloned.events = cloned.events.map((event) => {
      const cleaned = { ...event }
      delete cleaned.characterIds
      delete cleaned.settingIds
      return cleaned
    })
  }

  if (cloned.settings) {
    cloned.settings = cloned.settings.map((setting) => {
      const cleaned = { ...setting }
      delete cleaned.relatedCharacterIds
      delete cleaned.parentSettingId
      return cleaned
    })
  }

  return cloned
}

export async function loadWorkspaceFromFirestore(bookId) {
  if (!bookId) {
    return null
  }

  const bookRef = doc(db, 'books', bookId)
  const [bookSnap, charactersSnap, eventsSnap, settingsSnap, relationshipsSnap] = await Promise.all(
    [
      getDoc(bookRef),
      getDocs(collection(db, 'books', bookId, 'characters')),
      getDocs(collection(db, 'books', bookId, 'events')),
      getDocs(collection(db, 'books', bookId, 'settings')),
      getDocs(collection(db, 'books', bookId, 'relationships')),
    ],
  )

  if (!bookSnap.exists()) {
    return null
  }

  return {
    book: { id: bookSnap.id, ...bookSnap.data() },
    characters: charactersSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
    events: eventsSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
    settings: settingsSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
    relationships: relationshipsSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
  }
}
