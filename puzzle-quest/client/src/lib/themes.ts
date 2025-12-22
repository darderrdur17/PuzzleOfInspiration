export type ThemeId = 'aurora-grove' | 'chrono-forge' | 'tidal-circuit' | 'lumen-bazaar' | 'mythic-atrium';

export interface PuzzleTheme {
  id: ThemeId;
  name: string;
  description: string;
  image: string;
  primaryColor: string;
  accentColor: string;
  quotes: string[];
}

export const themes: PuzzleTheme[] = [
  {
    id: 'aurora-grove',
    name: 'Aurora Grove',
    description: 'A mystical forest clearing illuminated by vibrant aurora borealis.',
    image: '/images/aurora-grove.jpg',
    primaryColor: 'oklch(0.6 0.2 150)',
    accentColor: 'oklch(0.8 0.2 140)',
    quotes: [
      "Nature does not hurry, yet everything is accomplished.",
      "In every walk with nature one receives far more than he seeks.",
      "The clearest way into the Universe is through a forest wilderness.",
      "Look deep into nature, and then you will understand everything better.",
      "To sit in the shade on a fine day and look upon verdure is the most perfect refreshment.",
      "Adopt the pace of nature: her secret is patience.",
      "The earth has music for those who listen.",
      "Wilderness is not a luxury but a necessity of the human spirit.",
      "Time spent among trees is never time wasted.",
      "Let the rain kiss you. Let the rain beat upon your head with silver liquid drops.",
      "Keep close to Nature's heart... and break clear away, once in a while.",
      "The poetry of earth is never dead.",
      "Study nature, love nature, stay close to nature. It will never fail you.",
      "Colors are the smiles of nature.",
      "Green is the prime color of the world, and that from which its loveliness arises.",
      "There is a pleasure in the pathless woods.",
      "I go to nature to be soothed and healed, and to have my senses put in order.",
      "He is richest who is content with the least, for content is the wealth of nature.",
      "Nature is the art of God.",
      "Every flower is a soul blossoming in nature."
    ]
  },
  {
    id: 'chrono-forge',
    name: 'Chrono Forge',
    description: 'A steampunk workshop filled with intricate gears and steam pipes.',
    image: '/images/chrono-forge.jpg',
    primaryColor: 'oklch(0.6 0.15 50)',
    accentColor: 'oklch(0.8 0.2 60)',
    quotes: [
      "Time is the most valuable thing a man can spend.",
      "The future depends on what you do today.",
      "Lost time is never found again.",
      "Time waits for no one.",
      "Patience is the companion of wisdom.",
      "The two most powerful warriors are patience and time.",
      "Time flies over us, but leaves its shadow behind.",
      "Yesterday is gone. Tomorrow has not yet come. We have only today.",
      "Don't watch the clock; do what it does. Keep going.",
      "Time is a created thing. To say 'I don't have time,' is like saying, 'I don't want to.'",
      "The key is in not spending time, but in investing it.",
      "Time is what we want most, but what we use worst.",
      "It is the time you have wasted for your rose that makes your rose so important.",
      "Time brings all things to pass.",
      "Better three hours too soon than a minute too late.",
      "Time is the wisest counselor of all.",
      "We must use time as a tool, not as a couch.",
      "Determine never to be idle. No person will have occasion to complain of the want of time.",
      "Time creates all things and destroys them.",
      "Gears turn, and time marches on."
    ]
  },
  {
    id: 'tidal-circuit',
    name: 'Tidal Circuit',
    description: 'A futuristic coastal scene where nature meets technology.',
    image: '/images/tidal-circuit.jpg',
    primaryColor: 'oklch(0.6 0.2 240)',
    accentColor: 'oklch(0.8 0.2 200)',
    quotes: [
      "The cure for anything is salt water: sweat, tears or the sea.",
      "We are tied to the ocean. And when we go back to the sea, we are going back from whence we came.",
      "The sea, once it casts its spell, holds one in its net of wonder forever.",
      "Technology is best when it brings people together.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Innovation distinguishes between a leader and a follower.",
      "The ocean stirs the heart, inspires the imagination and brings eternal joy to the soul.",
      "Any sufficiently advanced technology is indistinguishable from magic.",
      "Man cannot discover new oceans unless he has the courage to lose sight of the shore.",
      "The wave is the same as the water, but the effect is different.",
      "Progress is impossible without change.",
      "The art of progress is to preserve order amid change and to preserve change amid order.",
      "Limitless tides, boundless future.",
      "Data flows like water, essential and powerful.",
      "Connect the currents, power the world.",
      "The sea does not like to be restrained.",
      "Technology is a useful servant but a dangerous master.",
      "Eternity begins and ends with the ocean's tides.",
      "Digital waves crash upon analog shores.",
      "Sync your soul with the rhythm of the tide."
    ]
  },
  {
    id: 'lumen-bazaar',
    name: 'Lumen Bazaar',
    description: 'A magical night market filled with colorful lanterns and exotic goods.',
    image: '/images/lumen-bazaar.jpg',
    primaryColor: 'oklch(0.6 0.2 330)',
    accentColor: 'oklch(0.8 0.2 40)',
    quotes: [
      "Light is the symbol of truth.",
      "There are two ways of spreading light: to be the candle or the mirror that reflects it.",
      "It is better to light a candle than curse the darkness.",
      "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.",
      "The market is a place set apart where men may deceive each other.",
      "Trade creates wealth, but trust builds empires.",
      "Every lantern holds a wish, every shadow hides a secret.",
      "In the bazaar of life, be a wise shopper.",
      "Colors speak all languages.",
      "Life is a great big canvas, and you should throw all the paint on it you can.",
      "Shine your light and make a positive impact on the world.",
      "The night is alive with the promise of tomorrow.",
      "A market is the heart of a city.",
      "Value is not determined by price, but by worth.",
      "Let your true colors shine.",
      "Wander where the wifi is weak and the lights are bright.",
      "Culture is the widening of the mind and of the spirit.",
      "Diversity is the spice of life.",
      "Exchange ideas as freely as goods.",
      "The glow of community warms the coldest night."
    ]
  },
  {
    id: 'mythic-atrium',
    name: 'Mythic Atrium',
    description: 'A grand ancient stone temple hall with mystical energy.',
    image: '/images/mythic-atrium.jpg',
    primaryColor: 'oklch(0.6 0.1 80)',
    accentColor: 'oklch(0.8 0.2 260)',
    quotes: [
      "Myths are public dreams, dreams are private myths.",
      "History is a myth that men agree to believe.",
      "We are all stories in the end.",
      "Legends never die.",
      "The past is never dead. It's not even past.",
      "Wisdom begins in wonder.",
      "Knowledge speaks, but wisdom listens.",
      "The only true wisdom is in knowing you know nothing.",
      "Fortune favors the bold.",
      "Destiny is not a matter of chance; it is a matter of choice.",
      "Heroes are made by the paths they choose, not the powers they are graced with.",
      "In the hall of kings, silence speaks volumes.",
      "Ancient stones hold ancient secrets.",
      "Magic is believing in yourself.",
      "The universe is full of magical things patiently waiting for our wits to grow sharper.",
      "Honor the past, create the future.",
      "Strength does not come from physical capacity. It comes from an indomitable will.",
      "Courage is grace under pressure.",
      "Every legend has a beginning.",
      "Walk with the giants of old."
    ]
  }
];
