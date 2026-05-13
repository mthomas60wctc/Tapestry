import { Book, Character, Event, Setting, Relationship, RELATIONSHIP_TYPES } from 'src/models'

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
      background: 'A noblewoman navigating family, loyalty, and political danger.',
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
      background: 'A young man balancing identity, duty, and belonging.',
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
      background: 'A skilled and stubborn survivor learning to move unseen.',
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
      climate: 'Cold',
      population: 5000,
      tags: ['north', 'stark'],
    }),
    new Setting({
      id: 'setting-kings-landing',
      bookId: book.id,
      name: 'King’s Landing',
      type: 'city',
      description: 'Capital of the Seven Kingdoms and center of political intrigue.',
      ruler: 'House Baratheon',
      climate: 'Temperate',
      population: 500000,
      tags: ['capital', 'court', 'politics'],
    }),
    new Setting({
      id: 'setting-the-wall',
      bookId: book.id,
      name: 'The Wall',
      type: 'fortification',
      description: 'Ancient barrier guarding the realm from the North.',
      ruler: 'Night’s Watch',
      climate: 'Frozen',
      population: 1000,
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
      relationshipType: RELATIONSHIP_TYPES.SPOUSE,
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
      relationshipType: RELATIONSHIP_TYPES.PARENT,
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
      relationshipType: RELATIONSHIP_TYPES.PARENT,
      description: 'Catelyn guides Arya through court life and survival.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-ned-winterfell',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.RULES,
      description: 'Ned rules at Winterfell.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-catelyn-winterfell',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: 'Catelyn lives at Winterfell.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-jon-winterfell',
      bookId: book.id,
      sourceId: characters[2].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: 'Jon is raised at Winterfell before joining the Watch.',
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-arya-winterfell',
      bookId: book.id,
      sourceId: characters[3].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: 'Arya grows up at Winterfell.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-ned-kl',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.VISITS,
      description: "Ned travels to King's Landing.",
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-catelyn-kl',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.VISITS,
      description: "Catelyn travels to King's Landing.",
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-arya-kl',
      bookId: book.id,
      sourceId: characters[3].id,
      sourceType: 'character',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.VISITS,
      description: "Arya is taken to King's Landing.",
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-jon-wall',
      bookId: book.id,
      sourceId: characters[2].id,
      sourceType: 'character',
      targetId: settings[2].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: "Jon joins the Night's Watch at the Wall.",
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-ned-exec',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: events[0].id,
      targetType: 'event',
      relationshipType: RELATIONSHIP_TYPES.PARTICIPATES_IN,
      description: 'Ned is the central figure in this tragic event.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-catelyn-exec',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: events[0].id,
      targetType: 'event',
      relationshipType: RELATIONSHIP_TYPES.WITNESSES,
      description: 'Catelyn witnesses the consequences.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-jon-exec',
      bookId: book.id,
      sourceId: characters[2].id,
      sourceType: 'character',
      targetId: events[0].id,
      targetType: 'event',
      relationshipType: RELATIONSHIP_TYPES.WITNESSES,
      description: "Jon learns of his father's fate.",
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-jon-watch',
      bookId: book.id,
      sourceId: characters[2].id,
      sourceType: 'character',
      targetId: events[1].id,
      targetType: 'event',
      relationshipType: RELATIONSHIP_TYPES.PARTICIPATES_IN,
      description: "Jon joins the Night's Watch.",
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-arya-flight',
      bookId: book.id,
      sourceId: characters[3].id,
      sourceType: 'character',
      targetId: events[2].id,
      targetType: 'event',
      relationshipType: RELATIONSHIP_TYPES.INITIATES,
      description: "Arya escapes King's Landing.",
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-exec-kl',
      bookId: book.id,
      sourceId: events[0].id,
      sourceType: 'event',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: "The execution takes place in King's Landing.",
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-watch-wall',
      bookId: book.id,
      sourceId: events[1].id,
      sourceType: 'event',
      targetId: settings[2].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'Jon joins at the Wall.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-flight-kl',
      bookId: book.id,
      sourceId: events[2].id,
      sourceType: 'event',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: "Arya flees from King's Landing.",
      strength: 'strong',
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
      tags: ['shire', 'hobbiton'],
    }),
    new Setting({
      id: 'setting-rivendell',
      bookId: book.id,
      name: 'Rivendell',
      type: 'sanctuary',
      description: 'Elven refuge where the Fellowship is formed.',
      tags: ['elves', 'sanctuary'],
    }),
    new Setting({
      id: 'setting-moria',
      bookId: book.id,
      name: 'Moria',
      type: 'dungeon',
      description: 'The abandoned dwarf realm beneath the mountains.',
      tags: ['dwarves', 'danger'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-elrond-council',
      bookId: book.id,
      title: 'The Council of Elrond',
      description: 'The Fellowship is formed and the ring quest begins.',
      chapter: 2,
      chapterTitle: 'The Council of Elrond',
      sequenceOrder: 2,
      arc: 'fellowship',
      emotionalTone: 'hopeful',
      tags: ['council', 'quest'],
    }),
    new Event({
      id: 'event-moria',
      bookId: book.id,
      title: 'Through Moria',
      description: 'The Fellowship journeys through the ancient dwarf halls.',
      chapter: 13,
      chapterTitle: 'A Journey in the Dark',
      sequenceOrder: 13,
      arc: 'journey',
      emotionalTone: 'tense',
      tags: ['dwarves', 'danger'],
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
      relationshipType: RELATIONSHIP_TYPES.ALLY,
      description: 'A loyal friendship that carries the quest forward.',
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
      relationshipType: RELATIONSHIP_TYPES.MENTOR,
      description: 'Gandalf guides Frodo toward the quest.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-frodo-bag-end',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.BORN_IN,
      description: 'Frodo begins his life in the Shire.',
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-council-rivendell',
      bookId: book.id,
      sourceId: events[0].id,
      sourceType: 'event',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The council takes place in Rivendell.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-moria-event',
      bookId: book.id,
      sourceId: events[1].id,
      sourceType: 'event',
      targetId: settings[2].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The Fellowship enters Moria.',
      strength: 'strong',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createMistbornWorkspace() {
  const book = new Book({
    id: 'book-003',
    title: 'Mistborn',
    author: 'Brandon Sanderson',
    series: 'Mistborn',
    seriesOrder: 1,
    genre: 'Fantasy',
    status: 'completed',
    description: 'A street thief joins a rebellion against an immortal ruler.',
    chapters: 24,
    tags: ['rebellion', 'magic', 'heist'],
  })

  const characters = [
    new Character({
      id: 'char-vin',
      bookId: book.id,
      name: 'Vin',
      role: 'protagonist',
      status: 'active',
      description: 'A sharp survivor who discovers her power.',
      tags: ['mistborn', 'thief'],
    }),
    new Character({
      id: 'char-kelsier',
      bookId: book.id,
      name: 'Kelsier',
      role: 'mentor',
      status: 'deceased',
      description: 'A charismatic rebel who inspires the skaa uprising.',
      tags: ['rebel', 'survivor'],
    }),
    new Character({
      id: 'char-elend',
      bookId: book.id,
      name: 'Elend Venture',
      role: 'supporting',
      status: 'active',
      description: 'A nobleman with reformist ideals.',
      tags: ['noble', 'scholar'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-luthadel',
      bookId: book.id,
      name: 'Luthadel',
      type: 'city',
      description: 'Capital city under the Lord Ruler’s dominion.',
      ruler: 'The Lord Ruler',
      climate: 'Ash-choked',
      population: 120000,
      tags: ['capital', 'ash'],
    }),
    new Setting({
      id: 'setting-canth',
      bookId: book.id,
      name: 'The Central Dominance',
      type: 'region',
      description: 'The political center of the Final Empire.',
      ruler: 'The Final Empire',
      climate: 'Harsh',
      population: 500000,
      tags: ['empire'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-planning',
      bookId: book.id,
      title: 'Planning the Rebellion',
      description: 'Kelsier and his crew plan the fall of the Final Empire.',
      chapter: 6,
      chapterTitle: 'The Survivor of Hathsin',
      sequenceOrder: 6,
      arc: 'rebellion',
      emotionalTone: 'determined',
      tags: ['plan', 'crew'],
    }),
    new Event({
      id: 'event-palace',
      bookId: book.id,
      title: 'The Final Confrontation',
      description: 'The rebellion reaches the Lord Ruler’s palace.',
      chapter: 23,
      chapterTitle: 'The Survivor of Hathsin',
      sequenceOrder: 23,
      arc: 'climax',
      emotionalTone: 'intense',
      tags: ['battle', 'palace'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-vin-kelsier',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: characters[0].id,
      targetType: 'character',
      relationshipType: RELATIONSHIP_TYPES.MENTOR,
      description: 'Kelsier trains and inspires Vin.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-vin-luthadel',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: 'Vin operates in and around Luthadel.',
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-kelsier-planning',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: events[0].id,
      targetType: 'event',
      relationshipType: RELATIONSHIP_TYPES.PARTICIPATES_IN,
      description: 'Kelsier drives the rebellion planning.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-palace-luthadel',
      bookId: book.id,
      sourceId: events[1].id,
      sourceType: 'event',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The confrontation takes place in Luthadel.',
      strength: 'strong',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

function createDuneWorkspace() {
  const book = new Book({
    id: 'book-004',
    title: 'Dune',
    author: 'Frank Herbert',
    series: 'Dune',
    seriesOrder: 1,
    genre: 'Science Fiction',
    status: 'completed',
    description: 'A duke’s son becomes entangled in a struggle for a desert world.',
    chapters: 22,
    tags: ['desert', 'politics', 'spice'],
  })

  const characters = [
    new Character({
      id: 'char-paul',
      bookId: book.id,
      name: 'Paul Atreides',
      role: 'protagonist',
      status: 'active',
      description: 'Heir to House Atreides and central to the prophecy.',
      tags: ['duke', 'prophecy'],
    }),
    new Character({
      id: 'char-jessica',
      bookId: book.id,
      name: 'Lady Jessica',
      role: 'supporting',
      status: 'active',
      description: 'Paul’s mother and a Bene Gesserit adept.',
      tags: ['bene gesserit', 'mother'],
    }),
    new Character({
      id: 'char-licher',
      bookId: book.id,
      name: 'Duncan Idaho',
      role: 'supporting',
      status: 'deceased',
      description: 'Swordmaster loyal to House Atreides.',
      tags: ['swordmaster', 'loyalty'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-arrakis',
      bookId: book.id,
      name: 'Arrakis',
      type: 'planet',
      description: 'Desert planet and sole source of spice.',
      ruler: 'Various Houses',
      climate: 'Arid',
      population: 1000000,
      tags: ['desert', 'spice'],
    }),
    new Setting({
      id: 'setting-arrakeen',
      bookId: book.id,
      name: 'Arrakeen',
      type: 'city',
      description: 'Capital city on Arrakis.',
      ruler: 'House Atreides',
      climate: 'Arid',
      population: 100000,
      tags: ['capital', 'desert'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-arrive-arrakis',
      bookId: book.id,
      title: 'Arrival on Arrakis',
      description: 'House Atreides assumes control of the desert planet.',
      chapter: 8,
      chapterTitle: 'Dune',
      sequenceOrder: 8,
      arc: 'arrival',
      emotionalTone: 'uneasy',
      tags: ['arrival', 'politics'],
    }),
    new Event({
      id: 'event-harvest',
      bookId: book.id,
      title: 'The Spice Harvest',
      description: 'A harvesting operation puts the world’s dangers on display.',
      chapter: 14,
      chapterTitle: 'Dune',
      sequenceOrder: 14,
      arc: 'conflict',
      emotionalTone: 'tense',
      tags: ['spice', 'worms'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-paul-jessica',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: characters[0].id,
      targetType: 'character',
      relationshipType: RELATIONSHIP_TYPES.PARENT,
      description: 'Jessica is Paul’s mother.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-paul-arrakis',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: 'Paul’s life becomes tied to Arrakis.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-arrival-arrakeen',
      bookId: book.id,
      sourceId: events[0].id,
      sourceType: 'event',
      targetId: settings[1].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The Atreides arrive in Arrakeen.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-harvest-arrakis',
      bookId: book.id,
      sourceId: events[1].id,
      sourceType: 'event',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The harvest happens on Arrakis.',
      strength: 'strong',
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
    description: 'A catastrophic game show turns Earth into a dungeon crawl.',
    chapters: 30,
    tags: ['game show', 'apocalypse', 'litrpg'],
  })

  const characters = [
    new Character({
      id: 'char-carl',
      bookId: book.id,
      name: 'Carl',
      role: 'protagonist',
      status: 'active',
      description: 'A reluctant crawler trying to survive the game.',
      tags: ['crawler', 'survivor'],
    }),
    new Character({
      id: 'char-donut',
      bookId: book.id,
      name: 'Princess Donut',
      role: 'supporting',
      status: 'active',
      description: 'A glamorous and highly opinionated cat.',
      tags: ['cat', 'companion'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-earth-dungeon',
      bookId: book.id,
      name: 'Earth Dungeon',
      type: 'world',
      description: 'The transformed planet serving as the first dungeon.',
      climate: 'Varied',
      population: 0,
      tags: ['apocalypse'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-cataclysm',
      bookId: book.id,
      title: 'The Collapse of Earth',
      description: 'The world is transformed into a dungeon crawl.',
      chapter: 1,
      chapterTitle: 'The Beginning',
      sequenceOrder: 1,
      arc: 'opening',
      emotionalTone: 'chaotic',
      tags: ['collapse', 'intro'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-carl-donut',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: RELATIONSHIP_TYPES.ALLY,
      description: 'Carl and Donut survive together.',
      strength: 'strong',
      bidirectional: true,
    }),
    new Relationship({
      id: 'rel-carl-dungeon',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.LIVES_IN,
      description: 'Carl is forced into the dungeon environment.',
      strength: 'medium',
    }),
    new Relationship({
      id: 'rel-collapse-earth',
      bookId: book.id,
      sourceId: events[0].id,
      sourceType: 'event',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The cataclysm happens on Earth.',
      strength: 'strong',
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
    description: 'A mathematician develops a plan to shorten a coming dark age.',
    chapters: 16,
    tags: ['empire', 'psychohistory', 'future'],
  })

  const characters = [
    new Character({
      id: 'char-hari',
      bookId: book.id,
      name: 'Hari Seldon',
      role: 'mentor',
      status: 'deceased',
      description: 'The visionary who creates psychohistory.',
      tags: ['scientist', 'mentor'],
    }),
    new Character({
      id: 'char-salvor',
      bookId: book.id,
      name: 'Salvor Hardin',
      role: 'protagonist',
      status: 'active',
      description: 'A political survivor and early leader of Terminus.',
      tags: ['leader', 'terminus'],
    }),
  ]

  const settings = [
    new Setting({
      id: 'setting-terminus',
      bookId: book.id,
      name: 'Terminus',
      type: 'planet',
      description: 'Remote world where the Foundation is established.',
      climate: 'Harsh',
      population: 10000,
      tags: ['foundation'],
    }),
  ]

  const events = [
    new Event({
      id: 'event-seldon-plan',
      bookId: book.id,
      title: 'The Seldon Plan',
      description: 'Hari Seldon’s predictions shape the future of the galaxy.',
      chapter: 1,
      chapterTitle: 'The Psychohistorians',
      sequenceOrder: 1,
      arc: 'foundation',
      emotionalTone: 'calculated',
      tags: ['science', 'future'],
    }),
  ]

  const relationships = [
    new Relationship({
      id: 'rel-hari-salvor',
      bookId: book.id,
      sourceId: characters[0].id,
      sourceType: 'character',
      targetId: characters[1].id,
      targetType: 'character',
      relationshipType: RELATIONSHIP_TYPES.MENTOR,
      description: 'Hari influences the generation that follows.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-salvor-terminus',
      bookId: book.id,
      sourceId: characters[1].id,
      sourceType: 'character',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.RULES,
      description: 'Salvor becomes a leader on Terminus.',
      strength: 'strong',
    }),
    new Relationship({
      id: 'rel-seldon-terminus',
      bookId: book.id,
      sourceId: events[0].id,
      sourceType: 'event',
      targetId: settings[0].id,
      targetType: 'setting',
      relationshipType: RELATIONSHIP_TYPES.TAKES_PLACE_IN,
      description: 'The plan influences events on Terminus.',
      strength: 'strong',
    }),
  ]

  return { book, characters, events, settings, relationships }
}

const workspaceFactories = {
  'book-001': createWesterosWorkspace,
  'book-002': createMiddleEarthWorkspace,
  'book-003': createMistbornWorkspace,
  'book-004': createDuneWorkspace,
  'book-005': createDungeonCrawlerCarlWorkspace,
  'book-006': createFoundationWorkspace,
}

export function createMockLibraryData() {
  const workspaces = Object.values(workspaceFactories).map((factory) => factory())

  return {
    books: workspaces.map((workspace) => withCover(workspace.book)),
  }
}

export function getMockWorkspaceData(bookId) {
  const factory = workspaceFactories[bookId]
  if (!factory) {
    return null
  }

  return factory()
}
