import { Book, Character, Event, Setting, Relationship } from 'src/models'

import gameOfThronesImg from './Covers/Game Of Thrones.jpg'
import fellowshipImg from './Covers/Fellowship of the Ring.jpg'
import mistbornImg from './Covers/Mistborn.jpg'
import duneImg from './Covers/Dune.jpg'
import dungeonCrawlerImg from './Covers/Dungeon Crawler Carl.jpg'
import foundationImg from './Covers/Foundation.jpg'

const coverMap = {
  'A Game of Thrones': gameOfThronesImg,
  'The Fellowship of the Ring': fellowshipImg,
  Mistborn: mistbornImg,
  Dune: duneImg,
  'Dungeon Crawler Carl': dungeonCrawlerImg,
  Foundation: foundationImg,
}

function withCover(book) {
  return {
    ...book,
    cover: coverMap[book.title] || null,
  }
}

function createWesterosWorkspace() {
  const book = new Book({
    id: 'book-001',
    title: 'A Game of Thrones',
    author: 'George R. R. Martin',
    series: 'A Song of Ice and Fire',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'completed',
    description: 'Noble houses struggle for influence while winter approaches.',
    chapters: 73,
    tags: ['politics', 'family', 'winter', 'war'],
  })

  const characters = [
    new Character({
      id: 'char-ned-stark',
      bookId: book.id,
      name: 'Eddard Stark',
      aliases: ['Ned'],
      role: 'protagonist',
      status: 'deceased',
      description: 'Lord of Winterfell and Warden of the North.',
      background: 'A duty-bound ruler whose honor shapes the opening conflict.',
      tags: ['Stark', 'Winterfell', 'honor'],
    }),
    new Character({
      id: 'char-catelyn-stark',
      bookId: book.id,
      name: 'Catelyn Stark',
      aliases: ['Catelyn Tully'],
      role: 'supporting',
      status: 'active',
      description: 'Matriarch of House Stark and a fierce protector of her family.',
      tags: ['Stark', 'Tully', 'family'],
    }),
    new Character({
      id: 'char-jon-snow',
      bookId: book.id,
      name: 'Jon Snow',
      aliases: ['Aegon Targaryen'],
      role: 'protagonist',
      status: 'active',
      description: 'A young man bound for the Night’s Watch and a larger destiny.',
      tags: ['Stark', 'Night’s Watch', 'north'],
    }),
    new Character({
      id: 'char-arya-stark',
      bookId: book.id,
      name: 'Arya Stark',
      aliases: ['Arry'],
      role: 'supporting',
      status: 'active',
      description: 'The youngest Stark daughter with a growing hunger for independence.',
      tags: ['Stark', 'needlework', 'survival'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-winterfell',
      bookId: book.id,
      name: 'Winterfell',
      type: 'castle',
      description: 'Ancestral seat of House Stark.',
      ruler: 'House Stark',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id, characters[3].id],
      tags: ['north', 'stark'],
    }),
    new Setting({
      id: 'setting-kings-landing',
      bookId: book.id,
      name: 'King’s Landing',
      type: 'city',
      description: 'Capital of the Seven Kingdoms and center of political intrigue.',
      ruler: 'House Baratheon',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[3].id],
      tags: ['capital', 'court', 'politics'],
    }),
    new Setting({
      id: 'setting-the-wall',
      bookId: book.id,
      name: 'The Wall',
      type: 'fortification',
      description: 'Ancient barrier guarding the realm from the North.',
      relatedCharacterIds: [characters[2].id],
      tags: ['watch', 'north'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-stark-execution',
      bookId: book.id,
      title: 'The Stark Execution',
      description: 'Ned Stark is condemned, reshaping the political landscape.',
      chapter: 13,
      chapterTitle: 'Baelor',
      sequenceOrder: 13,
      characterIds: [characters[0].id, characters[1].id, characters[2].id],
      settingIds: [settings[1].id],
      arc: 'house-politics',
      emotionalTone: 'tragic',
      tags: ['betrayal', 'politics'],
    }),
    new Event({
      id: 'event-jon-sworn',
      bookId: book.id,
      title: 'Jon Joins the Night’s Watch',
      description: 'Jon chooses duty over inheritance and heads to the Wall.',
      chapter: 10,
      chapterTitle: 'Jon',
      sequenceOrder: 10,
      characterIds: [characters[2].id],
      settingIds: [settings[2].id],
      arc: 'north-watch',
      emotionalTone: 'turning-point',
      tags: ['choice', 'duty'],
    }),
    new Event({
      id: 'event-arya-flight',
      bookId: book.id,
      title: 'Arya Flees the Capital',
      description: 'Arya escapes King’s Landing after witnessing the danger of court.',
      chapter: 18,
      chapterTitle: 'Arya',
      sequenceOrder: 18,
      characterIds: [characters[3].id],
      settingIds: [settings[1].id],
      arc: 'survival',
      emotionalTone: 'tense',
      tags: ['escape', 'survival'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-ned-catelyn',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: 'spouse',
      description: 'Marriage linking House Stark and House Tully.',
      strength: 'strong',
      bidirectional: true,
    }),
    new Relationship({
      id: 'rel-ned-jon',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[2].id,
      targetType: 'character',
      relationshipType: 'parent',
      description: 'Ned raises Jon as part of the Stark household.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-catelyn-arya',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: characters[3].id,
      targetType: 'character',
      relationshipType: 'parent',
      description: 'Catelyn guides Arya through court life and survival.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-jon-winterfell',
      bookId: book.id,
      sourceId: characters[2].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: 'resident-of',
      description: 'Jon is raised at Winterfell before joining the Watch.',
      strength: 'medium',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createMiddleEarthWorkspace() {
  const book = new Book({
    id: 'book-002',
    title: 'The Fellowship of the Ring',
    author: 'J. R. R. Tolkien',
    series: 'The Lord of the Rings',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'completed',
    description: 'A ring bearer begins a journey to resist the Shadow.',
    chapters: 22,
    tags: ['quest', 'fellowship', 'journey'],
  })

  const characters = [
    new Character({
      id: 'char-frodo',
      bookId: book.id,
      name: 'Frodo Baggins',
      role: 'protagonist',
      status: 'active',
      description: 'A hobbit tasked with carrying the One Ring.',
      tags: ['hobbit', 'ring bearer'],
    }),
    new Character({
      id: 'char-sam',
      bookId: book.id,
      name: 'Samwise Gamgee',
      aliases: ['Sam'],
      role: 'supporting',
      status: 'active',
      description: 'Loyal companion and steadfast friend.',
      tags: ['hobbit', 'friend'],
    }),
    new Character({
      id: 'char-gandalf',
      bookId: book.id,
      name: 'Gandalf',
      role: 'mentor',
      status: 'active',
      description: 'Wizard who helps shape the Fellowship.',
      tags: ['wizard', 'mentor'],
    }),
    new Character({
      id: 'char-aragorn',
      bookId: book.id,
      name: 'Aragorn',
      aliases: ['Strider'],
      role: 'protagonist',
      status: 'active',
      description: 'A ranger with a hidden claim to leadership.',
      tags: ['ranger', 'leader'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-bag-end',
      bookId: book.id,
      name: 'Bag End',
      type: 'home',
      description: 'Frodo’s home in the Shire.',
      relatedCharacterIds: [characters[0].id, characters[1].id],
      tags: ['shire', 'hobbiton'],
    }),
    new Setting({
      id: 'setting-rivendell',
      bookId: book.id,
      name: 'Rivendell',
      type: 'sanctuary',
      description: 'Elven refuge where the Fellowship is formed.',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id, characters[3].id],
      tags: ['elves', 'sanctuary'],
    }),
    new Setting({
      id: 'setting-moria',
      bookId: book.id,
      name: 'Moria',
      type: 'dungeon',
      description: 'The abandoned dwarf realm beneath the mountains.',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id, characters[3].id],
      tags: ['dwarves', 'danger'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-elrond-council',
      bookId: book.id,
      title: 'The Council of Elrond',
      description: 'The quest to destroy the Ring is chosen.',
      chapter: 10,
      chapterTitle: 'The Council of Elrond',
      sequenceOrder: 10,
      characterIds: [characters[0].id, characters[1].id, characters[2].id, characters[3].id],
      settingIds: [settings[1].id],
      arc: 'quest',
      emotionalTone: 'turning-point',
      tags: ['council', 'quest'],
    }),
    new Event({
      id: 'event-moria-fall',
      bookId: book.id,
      title: 'The Bridge of Khazad-dûm',
      description: 'The Fellowship loses Gandalf as they flee Moria.',
      chapter: 12,
      chapterTitle: 'The Bridge of Khazad-dûm',
      sequenceOrder: 12,
      characterIds: [characters[2].id, characters[0].id, characters[1].id],
      settingIds: [settings[2].id],
      arc: 'quest',
      emotionalTone: 'tragic',
      tags: ['loss', 'escape'],
    }),
    new Event({
      id: 'event-fellowship-breaks',
      bookId: book.id,
      title: 'The Fellowship Breaks',
      description: 'The group scatters and the quest continues in smaller paths.',
      chapter: 22,
      chapterTitle: 'The Breaking of the Fellowship',
      sequenceOrder: 22,
      characterIds: [characters[0].id, characters[1].id, characters[3].id],
      settingIds: [settings[1].id],
      arc: 'quest',
      emotionalTone: 'turning-point',
      tags: ['departure', 'change'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-frodo-sam',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: 'friend',
      description: 'A steadfast friendship carries the quest forward.',
      strength: 'strong',
      bidirectional: true,
    }),
    new Relationship({
      id: 'rel-gandalf-frodo',
      bookId: book.id,
      sourceId: characters[2].id,
      sourceType: 'character',
      targetId: characters[0].id,
      targetType: 'character',
      relationshipType: 'mentor',
      description: 'Gandalf guides Frodo toward the Fellowship.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-aragorn-fellowship',
      bookId: book.id,
      sourceId: characters[3].id,
      sourceType: 'character',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: 'visited',
      description: 'Aragorn meets the Fellowship in Rivendell.',
      strength: 'medium',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createMistbornWorkspace() {
  const book = new Book({
    id: 'book-003',
    title: 'Mistborn',
    author: 'Brandon Sanderson',
    series: 'The Final Empire',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'in-progress',
    description: 'A crew tries to overthrow an immortal tyrant.',
    chapters: 33,
    tags: ['heist', 'rebellion', 'magic'],
  })

  const characters = [
    new Character({
      id: 'char-vin',
      bookId: book.id,
      name: 'Vin',
      role: 'protagonist',
      status: 'active',
      description: 'A street thief learning to trust allies and power.',
      tags: ['mistborn', 'thief'],
    }),
    new Character({
      id: 'char-kelsier',
      bookId: book.id,
      name: 'Kelsier',
      role: 'mentor',
      status: 'deceased',
      description: 'A charismatic leader of the rebellion.',
      tags: ['rebel', 'leader'],
    }),
    new Character({
      id: 'char-elend',
      bookId: book.id,
      name: 'Elend Venture',
      role: 'supporting',
      status: 'active',
      description: 'A noble with idealistic ambitions.',
      tags: ['nobility', 'politics'],
    }),
    new Character({
      id: 'char-sazed',
      bookId: book.id,
      name: 'Sazed',
      role: 'supporting',
      status: 'active',
      description: 'A scholarly Terrisman keeper of knowledge.',
      tags: ['scholar', 'keeper'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-luthadel',
      bookId: book.id,
      name: 'Luthadel',
      type: 'city',
      description: 'The imperial capital under the Lord Ruler.',
      ruler: 'The Lord Ruler',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id, characters[3].id],
      tags: ['capital', 'rebellion'],
    }),
    new Setting({
      id: 'setting-kredik-shaw',
      bookId: book.id,
      name: 'Kredik Shaw',
      type: 'palace',
      description: 'The citadel of the empire and symbol of domination.',
      ruler: 'The Lord Ruler',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id],
      tags: ['palace', 'power'],
    }),
    new Setting({
      id: 'setting-final-empire',
      bookId: book.id,
      name: 'The Final Empire',
      type: 'realm',
      description: 'An oppressive world where ash falls from the sky.',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id, characters[3].id],
      tags: ['empire', 'ash'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-survivor-plan',
      bookId: book.id,
      title: 'The Survivor’s Plan',
      description: 'Kelsier lays out the first moves against the empire.',
      chapter: 8,
      chapterTitle: 'Crew Assembly',
      sequenceOrder: 8,
      characterIds: [characters[0].id, characters[1].id, characters[3].id],
      settingIds: [settings[0].id],
      arc: 'rebellion',
      emotionalTone: 'hopeful',
      tags: ['plan', 'crew'],
    }),
    new Event({
      id: 'event-kredik-shaw',
      bookId: book.id,
      title: 'Heist at Kredik Shaw',
      description: 'The crew infiltrates the palace to strike at the empire.',
      chapter: 24,
      chapterTitle: 'The Assault',
      sequenceOrder: 24,
      characterIds: [characters[0].id, characters[1].id, characters[2].id],
      settingIds: [settings[1].id],
      arc: 'rebellion',
      emotionalTone: 'tense',
      tags: ['heist', 'palace'],
    }),
    new Event({
      id: 'event-skaa-uprising',
      bookId: book.id,
      title: 'The Skaa Uprising',
      description: 'Rebellion erupts as the city is pushed toward revolution.',
      chapter: 33,
      chapterTitle: 'Aftermath',
      sequenceOrder: 33,
      characterIds: [characters[0].id, characters[2].id, characters[3].id],
      settingIds: [settings[2].id],
      arc: 'rebellion',
      emotionalTone: 'turning-point',
      tags: ['revolution', 'freedom'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-kelsier-vin',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: characters[0].id,
      targetType: 'character',
      relationshipType: 'mentor',
      description: 'Kelsier trains Vin as part of the crew.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-vin-elend',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[2].id,
      targetType: 'character',
      relationshipType: 'ally',
      description: 'Vin and Elend align around reform and trust.',
      strength: 'medium',
      bidirectional: true,
    }),
    new Relationship({
      id: 'rel-sazed-luthadel',
      bookId: book.id,
      sourceId: characters[3].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: 'resident-of',
      description: 'Sazed moves through Luthadel as part of the rebellion.',
      strength: 'medium',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createDuneWorkspace() {
  const book = new Book({
    id: 'book-004',
    title: 'Dune',
    author: 'Frank Herbert',
    series: 'Dune Chronicles',
    seriesOrder: 1,
    genre: 'Science Fiction',
    status: 'completed',
    description: 'A young man must navigate politics, religion, and ecology on a desert planet.',
    chapters: 68,
    tags: ['politics', 'religion', 'desert', 'prophecy'],
  })

  const characters = [
    new Character({
      id: 'char-paul-atreides',
      bookId: book.id,
      name: 'Paul Atreides',
      aliases: ["Muad'Dib"],
      role: 'protagonist',
      status: 'active',
      description: "Duke's son forced into a dangerous political game on Arrakis.",
      background: 'Trained in Bene Gesserit ways and military strategy.',
      tags: ['Atreides', 'prophecy', 'leadership'],
    }),
    new Character({
      id: 'char-lady-jessica',
      bookId: book.id,
      name: 'Lady Jessica',
      aliases: ['Jessica'],
      role: 'supporting',
      status: 'active',
      description: "Paul's mother and a Bene Gesserit member.",
      tags: ['Bene Gesserit', 'wisdom'],
    }),
    new Character({
      id: 'char-leto-atreides',
      bookId: book.id,
      name: 'Leto Atreides',
      aliases: ['Duke Leto'],
      role: 'supporting',
      status: 'deceased',
      description: "Paul's father and Duke of House Atreides.",
      tags: ['Atreides', 'nobility', 'honor'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-arrakis',
      bookId: book.id,
      name: 'Arrakis',
      type: 'planet',
      description: 'Desert planet essential to the galactic economy, source of spice.',
      ruler: 'Variable',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id],
      tags: ['desert', 'spice', 'ecology'],
    }),
    new Setting({
      id: 'setting-caladan',
      bookId: book.id,
      name: 'Caladan',
      type: 'planet',
      description: 'Water-rich homeworld of House Atreides.',
      ruler: 'House Atreides',
      relatedCharacterIds: [characters[0].id, characters[1].id, characters[2].id],
      tags: ['water', 'home'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-dune-arrival',
      bookId: book.id,
      title: 'Arrival on Arrakis',
      chapter: 1,
      description: 'House Atreides arrives at Arrakis to take control of spice production.',
      tags: ['arrival', 'politics'],
    }),
    new Event({
      id: 'event-dune-betrayal',
      bookId: book.id,
      title: 'The Betrayal',
      chapter: 18,
      description: 'House Harkonnen orchestrates the downfall of House Atreides.',
      tags: ['betrayal', 'war'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-paul-jessica',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: 'family',
      description: 'Mother and son bond amid political turmoil.',
      strength: 'strong',
      bidirectional: true,
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createDungeonCrawlerCarlWorkspace() {
  const book = new Book({
    id: 'book-005',
    title: 'Dungeon Crawler Carl',
    author: 'Matt Dinniman',
    series: 'Dungeon Crawler Carl',
    seriesOrder: 1,
    genre: 'LitRPG',
    status: 'in-progress',
    description:
      'A man and his cat navigate a deadly dungeon with nothing but humor and determination.',
    chapters: 150,
    tags: ['dungeon', 'comedy', 'survival', 'litrpg'],
  })

  const characters = [
    new Character({
      id: 'char-carl',
      bookId: book.id,
      name: 'Carl',
      aliases: ['Carl Aun-Josef'],
      role: 'protagonist',
      status: 'active',
      description: 'A man trapped in a dungeon with his cat. Uses humor and cunning to survive.',
      background: 'Former human dealing with dungeon reality.',
      tags: ['survival', 'humor', 'human'],
    }),
    new Character({
      id: 'char-regina',
      bookId: book.id,
      name: 'Regina',
      aliases: ['Donut', 'Queen Regent'],
      role: 'supporting',
      status: 'active',
      description: "Carl's cat who has become a powerful dungeon entity.",
      tags: ['cat', 'power', 'companion'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-dungeon',
      bookId: book.id,
      name: 'The Dungeon',
      type: 'dungeon',
      description: 'An endless series of floors filled with monsters and treasures.',
      ruler: 'Unknown',
      relatedCharacterIds: [characters[0].id, characters[1].id],
      tags: ['dungeon', 'maze', 'danger'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-dcc-start',
      bookId: book.id,
      title: 'Descent Begins',
      chapter: 1,
      description: 'Carl wakes up in the dungeon and must adapt to dungeon rules.',
      tags: ['start', 'adaptation'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-carl-regina',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: 'companionship',
      description: 'Carl and Regina navigate the dungeon together.',
      strength: 'strong',
      bidirectional: true,
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createFoundationWorkspace() {
  const book = new Book({
    id: 'book-006',
    title: 'Foundation',
    author: 'Isaac Asimov',
    series: 'Foundation',
    seriesOrder: 1,
    genre: 'Science Fiction',
    status: 'completed',
    description:
      'A mathematician predicts the fall of a galactic empire and creates a foundation to preserve knowledge.',
    chapters: 15,
    tags: ['psychohistory', 'empire', 'knowledge', 'future'],
  })

  const characters = [
    new Character({
      id: 'char-hari-seldon',
      bookId: book.id,
      name: 'Hari Seldon',
      aliases: ['The Mathematician'],
      role: 'protagonist',
      status: 'deceased',
      description: 'Creator of psychohistory and founder of the Foundation.',
      background: "Brilliant mathematician who foresees the empire's collapse.",
      tags: ['genius', 'foresight', 'foundation'],
    }),
    new Character({
      id: 'char-gaal-dornick',
      bookId: book.id,
      name: 'Gaal Dornick',
      aliases: ['Gaal'],
      role: 'supporting',
      status: 'active',
      description: "A young mathematician drawn into Seldon's grand plan.",
      tags: ['youth', 'idealism', 'mathematics'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-trantor',
      bookId: book.id,
      name: 'Trantor',
      type: 'planet',
      description: 'Capital of the Galactic Empire, a completely urbanized world.',
      ruler: 'Galactic Empire',
      relatedCharacterIds: [characters[0].id, characters[1].id],
      tags: ['empire', 'capital', 'urban'],
    }),
    new Setting({
      id: 'setting-terminus',
      bookId: book.id,
      name: 'Terminus',
      type: 'planetary-system',
      description: 'Remote planet chosen to house the Foundation.',
      ruler: 'The Foundation',
      relatedCharacterIds: [characters[0].id, characters[1].id],
      tags: ['foundation', 'knowledge', 'isolated'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-foundation-founding',
      bookId: book.id,
      title: 'Foundation Established',
      chapter: 3,
      description: 'The Foundation is established on Terminus to preserve galactic knowledge.',
      tags: ['founding', 'preservation'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-seldon-dornick',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: 'mentor',
      description: "Seldon guides Dornick into the Foundation's purpose.",
      strength: 'medium',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

export function createMockLibraryData() {
  const workspaces = [
    createWesterosWorkspace(),
    createMiddleEarthWorkspace(),
    createMistbornWorkspace(),
    createDuneWorkspace(),
    createDungeonCrawlerCarlWorkspace(),
    createFoundationWorkspace(),
  ]

  const books = workspaces.map((workspace) => withCover(workspace.book))

  return {
    books,
    workspaces: Object.fromEntries(workspaces.map((workspace) => [workspace.book.id, workspace])),
  }
}

export function getMockLibraryBooks() {
  return createMockLibraryData().books
}

export function getMockWorkspaceData(bookId) {
  return createMockLibraryData().workspaces[bookId] || null
}
