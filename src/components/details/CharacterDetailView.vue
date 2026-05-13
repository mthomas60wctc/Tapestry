<template>
  <div class="q-pa-md q-gutter-md">
    <div>
      <div class="text-h6">{{ character.name || 'Unnamed Character' }}</div>
      <div class="text-body2 text-grey-7">{{ character.role || 'N/A' }}</div>
    </div>
    <q-separator />
    <div><strong>Status:</strong> {{ character.status || 'N/A' }}</div>
    <div v-if="character.aliases?.length">
      <strong>Aliases:</strong> {{ character.aliases.join(', ') }}
    </div>
    <div v-if="character.description">
      <strong>Description:</strong> {{ character.description }}
    </div>
    <div v-if="character.background"><strong>Background:</strong> {{ character.background }}</div>
    <div><strong>First Appearance:</strong> {{ character.firstAppearance || 'N/A' }}</div>
    <div v-if="character.tags?.length"><strong>Tags:</strong> {{ character.tags.join(', ') }}</div>

    <!-- Special Relationships -->
    <template v-if="specialRelationships.length">
      <q-separator />
      <div v-for="rel in specialRelationships" :key="rel.id" class="q-mb-sm">
        <strong
          >{{
            formatRelationshipLabel(Relationship.getReverseRelationshipType(rel.relationshipType))
          }}
          of:
        </strong>
        <span class="text-grey-8">{{ rel.targetName }}</span>
        <span v-if="rel.description" class="text-grey-7"> - {{ rel.description }}</span>
      </div>
    </template>

    <!-- Related Entities (Chips) -->
    <div v-if="relatedEntities.length">
      <q-separator />
      <div><strong>Related To:</strong></div>
      <div class="q-gutter-sm">
        <q-chip
          v-for="entity in relatedEntities"
          :key="entity.id"
          clickable
          :icon="getIconForEntityType(entity.type)"
          class="related-entity-chip"
          @click="onRelatedEntityClick(entity)"
        >
          {{ entity.label }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Relationship } from 'src/models/Relationship'

const props = defineProps({
  character: { type: Object, required: true },
  workspace: { type: Object, default: null },
})

const emit = defineEmits(['select-entity'])

const specialRelationships = computed(() => {
  if (!props.workspace?.relationships) return []

  return props.workspace.relationships
    .filter((rel) => {
      const isMentioned =
        (rel.sourceId === props.character.id && rel.sourceType === 'character') ||
        (rel.targetId === props.character.id && rel.targetType === 'character')
      return isMentioned && Relationship.isSpecialRelationshipType(rel.relationshipType)
    })
    .map((rel) => {
      const isSource = rel.sourceId === props.character.id
      const targetId = isSource ? rel.targetId : rel.sourceId
      const targetChar = props.workspace.characters?.find((c) => c.id === targetId)
      const displayRelType = isSource
        ? Relationship.getReverseRelationshipType(rel.relationshipType)
        : rel.relationshipType

      return {
        id: rel.id,
        relationshipType: displayRelType,
        targetName: targetChar?.name || 'Unknown Character',
        description: rel.description,
      }
    })
})

const relatedEntities = computed(() => {
  if (!props.workspace) return []

  const related = new Map()

  // Query ALL relationships where this character is involved
  props.workspace.relationships?.forEach((rel) => {
    const isSource = rel.sourceId === props.character.id && rel.sourceType === 'character'
    const isTarget = rel.targetId === props.character.id && rel.targetType === 'character'

    if (isSource) {
      // Character is the source - get target entity
      let targetEntity = null
      if (rel.targetType === 'character') {
        targetEntity = props.workspace.characters?.find((c) => c.id === rel.targetId)
      } else if (rel.targetType === 'event') {
        targetEntity = props.workspace.events?.find((e) => e.id === rel.targetId)
      } else if (rel.targetType === 'setting') {
        targetEntity = props.workspace.settings?.find((s) => s.id === rel.targetId)
      }

      if (targetEntity) {
        const label =
          rel.targetType === 'character'
            ? `${targetEntity.name} (${rel.relationshipType})`
            : targetEntity.title || targetEntity.name || 'Untitled'
        related.set(`${rel.targetType}-${rel.targetId}`, {
          id: rel.targetId,
          label,
          type: rel.targetType,
        })
      }
    } else if (isTarget) {
      // Character is the target - get source entity
      let sourceEntity = null
      if (rel.sourceType === 'character') {
        sourceEntity = props.workspace.characters?.find((c) => c.id === rel.sourceId)
      } else if (rel.sourceType === 'event') {
        sourceEntity = props.workspace.events?.find((e) => e.id === rel.sourceId)
      } else if (rel.sourceType === 'setting') {
        sourceEntity = props.workspace.settings?.find((s) => s.id === rel.sourceId)
      }

      if (sourceEntity) {
        const label =
          rel.sourceType === 'character'
            ? `${sourceEntity.name} (${rel.relationshipType})`
            : sourceEntity.title || sourceEntity.name || 'Untitled'
        related.set(`${rel.sourceType}-${rel.sourceId}`, {
          id: rel.sourceId,
          label,
          type: rel.sourceType,
        })
      }
    }
  })

  return Array.from(related.values()).sort((a, b) => a.label.localeCompare(b.label))
})

function formatRelationshipLabel(type) {
  return Relationship.getDisplayLabel(type)
}

function getIconForEntityType(type) {
  const icons = {
    character: 'person',
    event: 'event',
    setting: 'place',
  }
  return icons[type] || 'help'
}

function onRelatedEntityClick(entity) {
  emit('select-entity', entity)
}
</script>

<style scoped>
.related-entity-chip {
  cursor: pointer;
}
</style>
