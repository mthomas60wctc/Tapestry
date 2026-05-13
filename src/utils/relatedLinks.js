function getEntityCollection(workspace, type) {
  if (!workspace) {
    return []
  }

  switch (type) {
    case 'book':
      return [workspace.book].filter(Boolean)
    case 'character':
      return workspace.characters || []
    case 'event':
      return workspace.events || []
    case 'setting':
      return workspace.settings || []
    case 'relationship':
      return workspace.relationships || []
    default:
      return []
  }
}

function findEntity(workspace, type, id) {
  return getEntityCollection(workspace, type).find((entity) => entity.id === id) || null
}

function formatDisplayName(entity, type) {
  if (!entity) {
    return 'Unknown'
  }

  switch (type) {
    case 'book':
      return entity.title || 'Untitled Book'
    case 'character':
      return entity.name || 'Unnamed Character'
    case 'event':
      return entity.title || 'Untitled Event'
    case 'setting':
      return entity.name || 'Unnamed Setting'
    case 'relationship':
      return entity.relationshipType || 'Relationship'
    default:
      return entity.name || entity.title || entity.id || 'Unknown'
  }
}

function getIconForType(type) {
  const iconMap = {
    character: 'person',
    Character: 'person',
    event: 'event',
    Event: 'event',
    setting: 'place',
    Setting: 'place',
    relationship: 'link',
    Relationship: 'link',
  }
  return iconMap[type] || null
}

function addRelatedLink(items, seen, label, side, id) {
  const key = id || `${side}:${label}`
  if (seen.has(key)) {
    return
  }

  seen.add(key)
  items.push({
    id,
    label,
    side,
    icon: getIconForType(side),
  })
}

function collectCharacterLinks(workspace, character, items, seen) {
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === character.id && relationship.sourceType === 'character') ||
        (relationship.targetId === character.id && relationship.targetType === 'character'),
    )
    .forEach((relationship) => {
      const otherId =
        relationship.sourceId === character.id ? relationship.targetId : relationship.sourceId
      const other = findEntity(workspace, 'character', otherId)

      if (!other) {
        return
      }

      addRelatedLink(items, seen, formatDisplayName(other, 'character'), 'Character', other.id)
    })

  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === character.id &&
          relationship.sourceType === 'character' &&
          relationship.targetType === 'event') ||
        (relationship.targetId === character.id &&
          relationship.targetType === 'character' &&
          relationship.sourceType === 'event'),
    )
    .forEach((relationship) => {
      const eventId =
        relationship.sourceType === 'event' ? relationship.sourceId : relationship.targetId
      const event = findEntity(workspace, 'event', eventId)

      if (!event) {
        return
      }

      addRelatedLink(items, seen, formatDisplayName(event, 'event'), 'Event', event.id)
    })

  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === character.id &&
          relationship.sourceType === 'character' &&
          relationship.targetType === 'setting') ||
        (relationship.targetId === character.id &&
          relationship.targetType === 'character' &&
          relationship.sourceType === 'setting'),
    )
    .forEach((relationship) => {
      const settingId =
        relationship.sourceType === 'setting' ? relationship.sourceId : relationship.targetId
      const setting = findEntity(workspace, 'setting', settingId)

      if (!setting) {
        return
      }

      addRelatedLink(items, seen, formatDisplayName(setting, 'setting'), 'Setting', setting.id)
    })
}

function collectEventLinks(workspace, event, items, seen) {
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === event.id &&
          relationship.sourceType === 'event' &&
          relationship.targetType === 'character') ||
        (relationship.targetId === event.id &&
          relationship.targetType === 'event' &&
          relationship.sourceType === 'character'),
    )
    .forEach((relationship) => {
      const characterId =
        relationship.sourceType === 'character' ? relationship.sourceId : relationship.targetId
      const character = findEntity(workspace, 'character', characterId)

      if (!character) {
        return
      }

      addRelatedLink(
        items,
        seen,
        formatDisplayName(character, 'character'),
        'Character',
        character.id,
      )
    })

  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === event.id &&
          relationship.sourceType === 'event' &&
          relationship.targetType === 'setting') ||
        (relationship.targetId === event.id &&
          relationship.targetType === 'event' &&
          relationship.sourceType === 'setting'),
    )
    .forEach((relationship) => {
      const settingId =
        relationship.sourceType === 'setting' ? relationship.sourceId : relationship.targetId
      const setting = findEntity(workspace, 'setting', settingId)

      if (!setting) {
        return
      }

      addRelatedLink(items, seen, formatDisplayName(setting, 'setting'), 'Setting', setting.id)
    })
}

function collectSettingLinks(workspace, setting, items, seen) {
  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === setting.id &&
          relationship.sourceType === 'setting' &&
          relationship.targetType === 'character') ||
        (relationship.targetId === setting.id &&
          relationship.targetType === 'setting' &&
          relationship.sourceType === 'character'),
    )
    .forEach((relationship) => {
      const characterId =
        relationship.sourceType === 'character' ? relationship.sourceId : relationship.targetId
      const character = findEntity(workspace, 'character', characterId)

      if (!character) {
        return
      }

      addRelatedLink(
        items,
        seen,
        formatDisplayName(character, 'character'),
        'Character',
        character.id,
      )
    })

  workspace.relationships
    .filter(
      (relationship) =>
        (relationship.sourceId === setting.id &&
          relationship.sourceType === 'setting' &&
          relationship.targetType === 'event') ||
        (relationship.targetId === setting.id &&
          relationship.targetType === 'setting' &&
          relationship.sourceType === 'event'),
    )
    .forEach((relationship) => {
      const eventId =
        relationship.sourceType === 'event' ? relationship.sourceId : relationship.targetId
      const event = findEntity(workspace, 'event', eventId)

      if (!event) {
        return
      }

      addRelatedLink(items, seen, formatDisplayName(event, 'event'), 'Event', event.id)
    })
}

function collectRelationshipLinks(workspace, relationship, items, seen) {
  const source = findEntity(workspace, relationship.sourceType, relationship.sourceId)
  const target = findEntity(workspace, relationship.targetType, relationship.targetId)

  if (source) {
    addRelatedLink(
      items,
      seen,
      `Source: ${formatDisplayName(source, relationship.sourceType)}`,
      relationship.sourceType === 'character'
        ? 'Character'
        : relationship.sourceType === 'event'
          ? 'Event'
          : 'Setting',
      source.id,
    )
  }

  if (target) {
    addRelatedLink(
      items,
      seen,
      `Target: ${formatDisplayName(target, relationship.targetType)}`,
      relationship.targetType === 'character'
        ? 'Character'
        : relationship.targetType === 'event'
          ? 'Event'
          : 'Setting',
      target.id,
    )
  }
}

function collectBookLinks(workspace, items, seen) {
  workspace.characters.slice(0, 4).forEach((character) => {
    addRelatedLink(
      items,
      seen,
      formatDisplayName(character, 'character'),
      'Character',
      character.id,
    )
  })

  workspace.events.slice(0, 3).forEach((event) => {
    addRelatedLink(items, seen, formatDisplayName(event, 'event'), 'Event', event.id)
  })

  workspace.settings.slice(0, 3).forEach((setting) => {
    addRelatedLink(items, seen, formatDisplayName(setting, 'setting'), 'Setting', setting.id)
  })
}

export function buildRelatedLinks(workspace, selection) {
  if (!workspace || !selection) {
    return []
  }

  const items = []
  const seen = new Set()

  switch (selection.type) {
    case 'character':
      collectCharacterLinks(workspace, selection.entity, items, seen)
      break
    case 'event':
      collectEventLinks(workspace, selection.entity, items, seen)
      break
    case 'setting':
      collectSettingLinks(workspace, selection.entity, items, seen)
      break
    case 'relationship':
      collectRelationshipLinks(workspace, selection.entity, items, seen)
      break
    case 'book':
    default:
      collectBookLinks(workspace, items, seen)
      break
  }

  return items
}
