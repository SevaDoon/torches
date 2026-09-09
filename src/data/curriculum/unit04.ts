import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-4');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'Change to the passive: "A company in Japan makes the car."',
  o: [
    'The car is made by a company in Japan.',
    'The car is making by a company in Japan.',
    'The car was made by a company in Japan.',
    'The car makes by a company in Japan.',
  ],
  a: 0,
  d: 1,
  ex: 'The simple present passive is am/is/are + past participle. The tense of the original sentence does not change.',
  h: [
    'Keep the same tense as the active sentence, then change the shape.',
    'Passive = a form of be + past participle.',
    'Example: This car is made in Japan.',
  ],
});

B.mc({
  q: 'Change to the passive: "The company has opened a new factory."',
  o: [
    'A new factory has been opened by the company.',
    'A new factory has opened by the company.',
    'A new factory is opened by the company.',
    'A new factory had been opened by the company.',
  ],
  a: 0,
  d: 2,
  ex: 'The present perfect passive is has/have been + past participle.',
  h: [
    'The original sentence is present perfect, so the passive must be present perfect too.',
    'Present perfect passive = has/have been + past participle.',
    'Example: Our products have been used by travellers all over the world.',
  ],
});

B.mc({
  q: 'Change to the passive: "In the future, people will drive smaller cars."',
  o: [
    'In the future, smaller cars will be driven.',
    'In the future, smaller cars will drive.',
    'In the future, smaller cars are driven.',
    'In the future, smaller cars will been driven.',
  ],
  a: 0,
  d: 2,
  ex: 'The future passive is will be + past participle.',
  h: [
    'Keep the future meaning, then add the passive shape.',
    'Future passive = will be + past participle.',
    'Example: A clean engine will be produced in the future.',
  ],
});

B.blk({
  q: 'Perfume ___ worn in Arabia, India, China and Japan for centuries. (has / be)',
  a: ['has been'],
  d: 3,
  ex: 'The action started in the past and continues, so the present perfect passive is used: has been + past participle.',
  h: [
    'The sentence needs two words before "worn".',
    'Present perfect passive = has/have been + past participle.',
    'Example: Perfume has been used since ancient times.',
  ],
});

B.mc({
  q: 'The hydrogen car is clean. It is ___ than other models.',
  o: ['cleaner', 'more clean', 'cleanest', 'the cleanest'],
  a: 0,
  d: 1,
  ex: 'Short adjectives form the comparative with -er, and than follows it.',
  h: [
    'Count the syllables in "clean".',
    'Short adjectives: add -er. Long adjectives: use more.',
    'Example: The bag is more expensive than the others.',
  ],
});

B.mc({
  q: 'It is ___ bag in the shop.',
  o: ['the most expensive', 'the expensivest', 'more expensive', 'expensiver'],
  a: 0,
  d: 1,
  ex: 'Long adjectives form the superlative with the most.',
  h: [
    '"Expensive" has three syllables.',
    'Superlative of long adjectives: the most + adjective.',
    'Example: It\'s the cleanest car of all.',
  ],
});

B.mc({
  q: 'The special suitcase is ___ a car.',
  o: ['as expensive as', 'as expensive than', 'more expensive as', 'the most expensive as'],
  a: 0,
  d: 2,
  ex: 'Use as + adjective + as to show that two things are the same in some way.',
  h: [
    'The same little word appears twice around the adjective.',
    'as + adjective + as shows two items are the same in some way.',
    'Example: The fold-up bicycle is not as bulky as a regular bicycle.',
  ],
});

B.mc({
  q: 'This new doorbell ___ just like a parrot.',
  o: ['sounds', 'looks', 'tastes', 'smells'],
  a: 0,
  d: 1,
  ex: 'Sound is used for what you hear; look for what you see; smell and taste for the other senses.',
  h: [
    'Which sense does a doorbell use?',
    'Use look, smell, sound or taste with like + noun.',
    'Example: The new compact car looks like a bug.',
  ],
});

B.mc({
  q: 'I like this new fragrance. It ___ like roses.',
  o: ['smells', 'sounds', 'looks', 'tastes'],
  a: 0,
  d: 1,
  ex: 'A fragrance is something you experience with your nose, so smell is the verb.',
  h: [
    'A fragrance is a scent.',
    'look / smell / sound / taste + like + noun.',
    'Example: This restaurant food doesn\'t taste like home cooking.',
  ],
});

B.ord({
  q: 'Turn the advice into an advertising slogan (imperative).',
  c: ['Clean', 'your teeth', 'with Sparkle toothpaste', 'for the brightest smile', '!'],
  d: 2,
  ex: 'An imperative starts with the base form of the verb and has no subject.',
  h: [
    'An order or an instruction never begins with "you".',
    'Imperative = base verb + the rest.',
    'Example: Buy these!',
  ],
});

B.err({
  t: ['The', 'first', 'car', 'was', 'make', 'by', 'Karl', 'Benz', 'in', '1886', '.'],
  a: 4,
  fix: 'made',
  d: 2,
  ex: 'The passive uses the past participle, not the base form of the verb.',
  h: [
    'Look at the word right after "was".',
    'Passive = be + past participle.',
    'Example: The suitcase was developed in the Netherlands.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each Unit 4 word with its meaning.',
  pairs: [
    ['bulky', 'large and awkward to carry'],
    ['portable', 'easy to carry from place to place'],
    ['customize', 'change something to suit one person'],
    ['compact', 'small and using little space'],
    ['revolutionize', 'change something completely'],
  ],
  d: 2,
  ex: 'These adjectives and verbs come from the Unit 4 product descriptions and the credit card reading.',
  h: [
    'Look for the pair you are sure of and take it off the board first.',
    'Adjectives here describe size and shape; verbs describe change.',
    'Example: In contrast to the standard bike, it is much smaller and less bulky.',
  ],
});

B.mem({
  q: 'Find the pairs: product and its key feature in the unit.',
  pairs: [
    ['FIAT 500', 'a triumph of Italian design'],
    ['Henk suitcase', 'wheels made of titanium'],
    ['fold-up bike', 'can be folded and stored easily'],
    ['first bicycles', 'made of wood with no pedals'],
  ],
  d: 2,
  ex: 'All four products are described on the Unit 4 opening pages.',
  h: [
    'Turn one card and hold the product in your head while you look.',
    'Each product in the unit has one feature the text repeats.',
    'Example: The Henk is the most expensive suitcase in the world.',
  ],
});

B.mc({
  q: 'The Diner\'s Club Card became a ___ for those who carried it — a sign of high social standing.',
  o: ['status symbol', 'franchise', 'reward programme', 'cash machine'],
  a: 0,
  d: 2,
  ex: 'A status symbol is an object that shows other people that its owner has an important position.',
  h: [
    'The definition is written right there in the question.',
    'Status symbol = a sign of high social standing.',
    'Example: In the 1950s the card was a status symbol.',
  ],
});

B.mc({
  q: 'Choose the word that means "impossible to imagine".',
  o: ['inconceivable', 'impractical', 'limited', 'transparent'],
  a: 0,
  d: 2,
  ex: 'Inconceivable is built from in- (not) + conceive (imagine).',
  h: [
    'Two of these start with a prefix meaning "not". Which one hides the idea of imagining?',
    'The prefixes in- and im- both mean "not".',
    'Example: A world without cash was simply inconceivable.',
  ],
});

B.blk({
  q: 'Add the prefix that means "not": ___practical.',
  a: ['im'],
  d: 2,
  ex: 'Before the letters m and p, the prefix in- becomes im-.',
  h: [
    'Say "inpractical" aloud. Does it feel comfortable?',
    'in- and im- both mean "not"; im- is used before p, b and m.',
    'Example: impossible, impatient, impractical.',
  ],
});

B.tf({
  q: 'Real Talk: "What are you up to?" means "What are you doing now?"',
  a: true,
  d: 1,
  ex: 'It is an informal way of asking what someone is doing at the moment.',
  h: [
    'Think about how Adnan greets Omar in the Unit 4 conversation.',
    'What are you up to? = What are you doing now?',
    'Example: Hi, Omar. What are you up to? — I\'m turning off my alarm.',
  ],
});

B.section('reading', '9 Reading', 'u4-p1');

B.mc({
  q: 'What happened to Frank McNamara at the restaurant in 1949?',
  o: [
    'He had left his wallet in another suit.',
    'He lost his credit card.',
    'The restaurant refused his money.',
    'He forgot the name of the restaurant.',
  ],
  a: 0,
  d: 1,
  ex: 'He changed suits before the dinner and realized at the table that his wallet was in the other suit.',
  h: [
    'The story of that evening is told in the second paragraph.',
    'Narrative texts usually give events in the order they happened.',
    'Example: Before he left for the dinner, Frank changed suits.',
  ],
});

B.mc({
  q: 'What is known in the credit card industry as the "First Supper"?',
  o: [
    'the meal Frank paid for with a cardboard card',
    'the first dinner at the Diner\'s Club',
    'the opening of the first restaurant',
    'the first meal paid for in cash',
  ],
  a: 0,
  d: 2,
  ex: 'A year after the embarrassing evening, Frank returned to the same restaurant and signed for the meal with a small cardboard card.',
  h: [
    'Find the phrase in quotation marks and read the sentence before it.',
    'A quoted phrase in a text is usually defined by the sentence around it.',
    'Example: Frank handed the waiter a small cardboard card and signed for the meal.',
  ],
});

B.tf({
  q: 'According to the passage, by 1952 the Diner\'s Club Card was accepted by thousands of businesses in the United States.',
  a: true,
  d: 1,
  ex: 'The text gives 1952 as the year when thousands of businesses accepted the card and it became a status symbol.',
  h: [
    'Dates are easy to scan for. Look for 1952.',
    'When a statement contains a number, check the number first.',
    'Example: The card became the first international charge card in 1952.',
  ],
});

B.mc({
  q: 'Which airline was the first to accept the Diner\'s Club Card?',
  o: ['Western Airlines', 'American Express', 'MasterCard Airways', 'Ideal Airlines'],
  a: 0,
  d: 2,
  ex: 'Western Airlines accepted the card in 1955, and ten years later every airline in the United States did.',
  h: [
    'Two of the options are not airlines at all.',
    'Eliminate impossible options before you choose.',
    'Example: American Express and MasterCard are card companies.',
  ],
});

B.mc({
  q: 'What was the purpose of the first card members rewards programme, created in 1984?',
  o: [
    'to give benefits and special privileges to loyal users',
    'to lower the price of the card',
    'to advertise the card on television',
    'to stop people using cash',
  ],
  a: 0,
  d: 2,
  ex: 'The programme was aimed mostly at business travellers and gave valuable benefits and special privileges to loyal users.',
  h: [
    'Look for the year 1984 in the passage.',
    'A date in a text often marks the beginning of a new stage.',
    'Example: Now many reward programmes offer free airline miles.',
  ],
});

B.mc({
  q: 'Choose the meaning of "franchise" as it is used in the passage.',
  o: ['a branch of a company', 'a French product', 'a large corporation', 'a type of card'],
  a: 0,
  d: 3,
  ex: 'The passage says the card had franchises in Canada, France and Cuba — branches of the company in other countries.',
  h: [
    'Look at the three countries listed just after the word.',
    'Use the examples that follow a word to work out its meaning.',
    'Example: The company opened branches in three countries.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Which socks are ___? — The black ___.',
  o: ['yours / ones', 'your / one', 'yours / one', 'your / ones'],
  a: 0,
  d: 2,
  ex: 'Yours is a possessive pronoun and stands alone. Ones replaces a plural noun.',
  h: [
    'The first gap has no noun after it. The second refers to more than one sock.',
    'Possessive pronouns stand alone: mine, yours, his, hers, ours, theirs. One/ones replaces a noun.',
    'Example: The red ones aren\'t mine.',
  ],
});

B.mc({
  q: '___ backpack is this? — It\'s mine.',
  o: ['Whose', 'Who', "Who's", 'Which'],
  a: 0,
  d: 1,
  ex: 'Whose asks about the owner of something.',
  h: [
    'The answer names an owner, not a person doing an action.',
    'Whose asks about possession.',
    'Example: Whose credit card is this? — It\'s hers.',
  ],
});

B.mc({
  q: 'That hat is ___ small for me, and the shoes are not big ___.',
  o: ['too / enough', 'enough / too', 'too / too', 'enough / enough'],
  a: 0,
  d: 2,
  ex: 'Too comes before the adjective and means "more than is wanted". Enough comes after the adjective and means "as much as is needed".',
  h: [
    'Notice where the missing word sits: before or after the adjective.',
    'too + adjective; adjective + enough.',
    'Example: The jacket is not big enough for me.',
  ],
});

B.mc({
  q: 'Choose the correct article: "It was ___ unusual time capsule."',
  o: ['an', 'a', 'the', 'no article'],
  a: 0,
  d: 1,
  ex: 'Use an before a word that starts with a vowel sound.',
  h: [
    'Say the word "unusual" out loud. What sound does it begin with?',
    'a before a consonant sound, an before a vowel sound.',
    'Example: an hour, a university.',
  ],
});

B.mc({
  q: 'Which sentence uses demonstratives correctly for something far away and plural?',
  o: ['Those are the best headphones.', 'These are the best headphones.', 'That are the best headphones.', 'This are the best headphones.'],
  a: 0,
  d: 2,
  ex: 'Near: this (singular), these (plural). Far: that (singular), those (plural).',
  h: [
    'Check two things: near or far, and one or more than one.',
    'this/these = near; that/those = far.',
    'Example: What are those? — They\'re keys.',
  ],
});

B.blk({
  q: 'Which coat do you like? — The green ___. (one item)',
  a: ['one'],
  d: 1,
  ex: 'One replaces a singular noun that has already been mentioned; ones replaces a plural one.',
  h: [
    'A coat is singular.',
    'one = singular, ones = plural.',
    'Example: Which boots do you prefer? — The leather ones.',
  ],
});

export const unit04: Unit = {
  id: 'unit-4',
  number: 4,
  title: 'The Art of Advertising',
  pages: '54–67',
  functions: [
    'Talk about commercials, ads and product history',
    'Describe products',
    'Make comparisons',
  ],
  grammar: [
    'The passive',
    'Comparatives and superlatives',
    'Similarities and differences (as + adjective + as)',
    'Verbs look, smell, sound, taste with like + noun',
    'Imperatives; indefinite articles a/an',
    'Possessive adjectives and pronouns; whose; one/ones; too/enough',
  ],
  passages: [
    {
      id: 'u4-p1',
      unitId: 'unit-4',
      title: 'The World of Plastic',
      source: 'Written for Torches, based on the Unit 4 reading about the history of the credit card (Student Book pages 60–61).',
      paragraphs: [
        'Can you imagine a world without credit cards? Until the 1950s, a world without the use of cash was simply inconceivable. Today an economic universe without plastic would be impractical, because the credit card is used to pay for goods and services from New York to Beijing.',
        'It all started in 1949, when Frank McNamara arranged a business dinner in a New York restaurant. Before he left for the dinner, Frank changed suits. When the waiter presented the check, Frank realized that he had left his wallet in the other suit. The embarrassing situation was solved, but that night Frank asked himself why people should be limited to spending only the cash they were carrying, instead of being able to spend what they could afford.',
        'A year later, Frank returned to the same restaurant. When the check came, he handed the waiter a small cardboard card and signed for the meal. This event is known in the credit card industry as the "First Supper". Soon the concept of charging a meal was picked up by merchants as an alternative to cash. By 1952 the card was accepted by thousands of businesses across the United States, and it had become a status symbol for those who carried it.',
        'The idea expanded quickly outside the United States, and in 1952 the card became the first international charge card, with franchises in Canada, France and Cuba. In 1955 Western Airlines became the first airline to accept it, and ten years later it was accepted by every airline in the United States. Other famous international cards were created later, such as American Express, Visa and MasterCard.',
        'In 1984 the first card members rewards programme was created, aimed mostly at business travellers. It gave valuable benefits and special privileges to loyal users. Ever since a businessman forgot his cash in 1949, an entirely new business has existed that revolutionized the way the world pays for goods and services.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'The passive',
      rule: 'Use the passive to emphasize what was done instead of who did it. Form it with the verb be + the past participle. Add by + the doer only when it matters.',
      examples: [
        'This car is made in Japan.',
        'The suitcase was developed in the Netherlands.',
        'A clean engine will be produced in the future.',
      ],
    },
    {
      skill: 'grammar',
      title: 'Comparing things',
      rule: 'Short adjectives take -er / the -est. Long adjectives take more / the most. Use as + adjective + as for things that are the same, and not as + adjective + as for things that are not.',
      examples: [
        "It's cleaner than other models. It's the cleanest car of all.",
        "It's more expensive than others. It's the most expensive bag.",
        'The fold-up bicycle is not as bulky as a regular bicycle.',
      ],
    },
    {
      skill: 'form',
      title: 'Possessives, one/ones, too/enough',
      rule: 'Possessive adjectives come before a noun (my hat); possessive pronouns stand alone (mine). Use one/ones to replace a noun. Too goes before an adjective; enough goes after it.',
      examples: [
        "It's his cell phone. It's his.",
        'Which coat do you like? — The green one.',
        'This jacket is too small. It is not big enough.',
      ],
    },
  ],
  questions: B.done(),
};
