import { Relationship } from 'src/models'

const ENTITY_COLLECTIONS = {
  character: 'characters',
  event: 'events',
  setting: 'settings',
}

const MANAGED_TARGET_TYPES = {
  character: ['character', 'event', 'setting'],
  event: ['character', 'setting'],
  setting: ['character', 'event', 'setting'],
}

export function getManagedTargetTypes(sourceType) {
  return MANAGED_TARGET_TYPES[sourceType] || []
}

export function getEntityCollection(workspace, type) {
  const key = ENTITY_COLLECTIONS[type]
  return key ? workspace?.[key] || [] : []
}

export function getEntityDisplayName(entity, type) {
  if (!entity) {
    return 'Unknown'
  }

  if (type === 'event') {
    return entity.title || 'Untitled Event'
  }

  if (type === 'setting') {
    return entity.name || 'Unnamed Setting'
  }

  return entity.name || 'Unnamed Character'
}

export function getEntityOptions(workspace, type, excludeId = null) {
  return getEntityCollection(workspace, type)
    .filter((entity) => entity.id !== excludeId)
    .map((entity) => ({
      label: getEntityDisplayName(entity, type),
      value: entity.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function findRelationshipBetween(workspace, sourceType, sourceId, targetType, targetId) {
  return (
    workspace?.relationships?.find(
      (relationship) =>
        (relationship.sourceType === sourceType &&
          relationship.sourceId === sourceId &&
          relationship.targetType === targetType &&
          relationship.targetId === targetId) ||
        (relationship.sourceType === targetType &&
          relationship.sourceId === targetId &&
          relationship.targetType === sourceType &&
          relationship.targetId === sourceId),
    ) || null
  )
}

export function collectRelationshipDrafts(workspace, sourceEntity, sourceType, targetTypes) {
  if (!workspace || !sourceEntity) {
    return []
  }

  const drafts = []

  targetTypes.forEach((targetType) => {
    getEntityCollection(workspace, targetType)
      .filter((entity) => entity.id !== sourceEntity.id)
      .forEach((targetEntity) => {
        const relationship = findRelationshipBetween(
          workspace,
          sourceType,
          sourceEntity.id,
          targetType,
          targetEntity.id,
        )

        if (!relationship) {
          return
        }

        const isDirect =
          relationship.sourceType === sourceType && relationship.sourceId === sourceEntity.id

        drafts.push({
          targetId: targetEntity.id,
          targetType,
          label: getEntityDisplayName(targetEntity, targetType),
          relationshipType: isDirect
            ? relationship.relationshipType
            : Relationship.getReverseRelationshipType(relationship.relationshipType),
          description: relationship.description || '',
          existingRelationshipId: relationship.id,
          strength: relationship.strength || 'medium',
          bidirectional: relationship.bidirectional || false,
        })
      })
  })

  return drafts.sort((a, b) => a.label.localeCompare(b.label))
}

export function collectSelectedRelationshipDrafts(
  workspace,
  sourceEntity,
  sourceType,
  selectedIdsByType,
) {
  if (!workspace || !sourceEntity) {
    return []
  }

  const drafts = []

  Object.entries(selectedIdsByType || {}).forEach(([targetType, selectedIds]) => {
    const allowedIds = new Set(selectedIds || [])
    getEntityCollection(workspace, targetType)
      .filter((entity) => allowedIds.has(entity.id) && entity.id !== sourceEntity.id)
      .forEach((targetEntity) => {
        const relationship = findRelationshipBetween(
          workspace,
          sourceType,
          sourceEntity.id,
          targetType,
          targetEntity.id,
        )

        const isDirect =
          relationship &&
          relationship.sourceType === sourceType &&
          relationship.sourceId === sourceEntity.id

        drafts.push({
          targetId: targetEntity.id,
          targetType,
          label: getEntityDisplayName(targetEntity, targetType),
          relationshipType: relationship
            ? isDirect
              ? relationship.relationshipType
              : Relationship.getReverseRelationshipType(relationship.relationshipType)
            : Relationship.getValidRelationshipTypes(sourceType, targetType)[0] || '',
          description: relationship?.description || '',
          existingRelationshipId: relationship?.id || null,
          strength: relationship?.strength || 'medium',
          bidirectional: relationship?.bidirectional || false,
        })
      })
  })

  return drafts.sort((a, b) => a.label.localeCompare(b.label))
}

export function buildRelationshipPayloads(sourceEntity, sourceType, drafts) {
  if (!sourceEntity || !drafts?.length) {
    return []
  }

  const now = new Date()

  return drafts
    .filter((draft) => draft?.targetId && draft?.relationshipType)
    .map((draft) => ({
      id:
        draft.existingRelationshipId ||
        globalThis.crypto?.randomUUID?.() ||
        `rel-${Date.now()}-${draft.targetId}`,
      bookId: sourceEntity.bookId,
      sourceId: sourceEntity.id,
      sourceType,
      targetId: draft.targetId,
      targetType: draft.targetType,
      relationshipType: draft.relationshipType,
      description: draft.description || '',
      strength: draft.strength || 'medium',
      bidirectional: draft.bidirectional || false,
      tags: draft.tags || [],
      createdAt: draft.createdAt || now,
      updatedAt: now,
    }))
}

export function getRelationshipTypeOptions(sourceType, targetType) {
  return Relationship.getValidRelationshipTypes(sourceType, targetType).map((type) => ({
    label: Relationship.getDisplayLabel(type),
    value: type,
  }))
}
