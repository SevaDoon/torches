import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-9');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'Someone needs to clean the windows. = The windows ___.',
  o: ['need to be cleaned', 'need to clean', 'needs to be cleaned', 'are needing to clean'],
  a: 0,
  d: 1,
  ex: 'Need to be + past participle moves the focus onto the thing, not the person doing the work.',
  h: [
    'The windows do not do the cleaning themselves.',
    'need to be + past participle.',
    'Example: The car seats need to be fixed.',
  ],
});

B.mc({
  q: 'The rooms need to be decorated. We ___ the rooms decorated next week.',
  o: ['are having', 'are decorating', 'have decorated', 'are being'],
  a: 0,
  d: 2,
  ex: 'Have or get + object + past participle means somebody else does the service for you.',
  h: [
    'Are you doing the work, or paying someone else to do it?',
    'have/get + something + past participle.',
    "Example: We're going to have the roof repaired.",
  ],
});

B.mc({
  q: 'The house needed to be painted. We ___ the house painted last month.',
  o: ['had', 'have', 'are having', 'will have'],
  a: 0,
  d: 2,
  ex: 'The time expression "last month" makes it a finished past action, so the simple past of have is used.',
  h: [
    'Look at the time expression at the end.',
    'have/get + something + past participle changes tense on the word have/get.',
    'Example: We had the apartment redecorated.',
  ],
});

B.mc({
  q: 'The vase was cracked. I threw away the ___ vase.',
  o: ['cracked', 'crack', 'cracking', 'cracks'],
  a: 0,
  d: 1,
  ex: 'A past participle can be used as an adjective before a noun.',
  h: [
    'The same word appears earlier in the sentence.',
    'Past participles as adjectives: broken, cracked, damaged, torn.',
    'Example: The mechanic fixed the damaged car.',
  ],
});

B.mc({
  q: 'Have you done the dishes ___? — Yes, I\'ve ___ done them.',
  o: ['yet / already', 'already / yet', 'just / yet', 'yet / yet'],
  a: 0,
  d: 2,
  ex: 'Yet goes at the end of questions and negatives. Already goes before the main verb in affirmative sentences.',
  h: [
    'One of these two words normally sits at the end of a question.',
    'yet → questions and negatives; already and just → affirmative.',
    "Example: No, I haven't washed them yet.",
  ],
});

B.mc({
  q: 'He ___ waiting in line.',
  o: ["can't stand", "can't stand to", "can't stands", "can't standing"],
  a: 0,
  d: 2,
  ex: "Can't stand is one of the verbs followed by a gerund, and modal verbs keep their base form.",
  h: [
    'Look at the -ing word after the gap and choose the verb form that fits it.',
    'Verbs followed by a gerund: avoid, enjoy, finish, give up, hate, keep, miss, mind, stop, suggest, can\'t stand.',
    "Example: I don't enjoy sitting in the sun.",
  ],
});

B.mc({
  q: 'She ___ some snacks for the party.',
  o: ['needs to buy', 'needs buying', 'need to buy', 'needs buy'],
  a: 0,
  d: 2,
  ex: 'Need, want and like are followed by the full infinitive: to + base verb.',
  h: [
    'Compare this with the verbs that take -ing.',
    'need / want / like + to + base verb.',
    "Example: He doesn't want to do the dishes.",
  ],
});

B.mc({
  q: 'Please turn the TV on. = Please turn ___.',
  o: ['it on', 'on it', 'the on it', 'it the on'],
  a: 0,
  d: 1,
  ex: 'An object pronoun always goes between the verb and the particle of a two-word verb.',
  h: [
    'Where does a pronoun sit in a two-word verb?',
    'Object pronouns always come between the verb and the particle.',
    'Example: Clean up the mess. → Clean it up.',
  ],
});

B.ord({
  q: 'Build the sentence with a gerund.',
  c: ["I can't resist", 'eating dessert', 'after meals', '.'],
  d: 2,
  ex: 'After resist the verb takes the -ing form.',
  h: [
    'The verb after "resist" is not an infinitive.',
    "can't resist + verb-ing.",
    'Example: The workers finished painting the house.',
  ],
});

B.err({
  t: ['The', 'windowpane', 'needs', 'to', 'be', 'fix', 'right', 'away', '.'],
  a: 5,
  fix: 'fixed',
  d: 2,
  ex: 'Need to be is followed by the past participle, not the base form.',
  h: [
    'Look at the word right after "be".',
    'need to be + past participle.',
    'Example: The thermostat needs to be fixed.',
  ],
});

B.blk({
  q: 'This computer keeps crashing. I\'m going to return ___ and ask for a refund. (the computer)',
  a: ['it'],
  d: 1,
  ex: 'The object pronoun for a thing is it.',
  h: [
    'You do not want to repeat the word "computer" twice.',
    'Object pronouns: me, you, him, her, it, us, them.',
    "Example: He doesn't like the shoes. He's going to return them.",
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each problem with the thing it describes.',
  pairs: [
    ['a dripping faucet', 'water keeps coming out of the tap'],
    ['a cracked windshield', 'the glass of the car is broken'],
    ['a torn sleeve', 'the arm of the jacket is ripped'],
    ['a flat tire', 'the wheel has no air'],
    ['a dead battery', 'the car has no electric power'],
  ],
  d: 2,
  ex: 'These consumer complaints are listed on the Unit 9 opening pages.',
  h: [
    'Sort them first: which are about a car, and which are about a house or clothes?',
    'The unit groups complaints into clothing, electronic products, car repairs and housing.',
    'Example: There\'s a broken windowpane. I\'ll have it fixed right away.',
  ],
});

B.mem({
  q: 'Find the pairs: problem and the service that fixes it.',
  pairs: [
    ['a stained jacket', 'dry-clean it'],
    ['a torn sleeve', 'sew it'],
    ['a blunt knife', 'sharpen it'],
    ['a broken engine part', 'replace it'],
  ],
  d: 2,
  ex: 'These verbs come from the Unit 9 grammar exercise on things that need to be done.',
  h: [
    'Turn one card and think about which worker would deal with it.',
    'The solutions in the unit are: dry-clean, repair, replace, sew and sharpen.',
    'Example: The jacket is stained. It needs to be dry-cleaned.',
  ],
});

B.mc({
  q: 'Which word describes walls that are very dirty?',
  o: ['filthy', 'faded', 'loose', 'intact'],
  a: 0,
  d: 2,
  ex: 'Filthy means extremely dirty. The Unit 9 complaint says the walls are filthy and need to be repainted.',
  h: [
    'One of these is much stronger than "a bit dirty".',
    'filthy = extremely dirty.',
    'Example: The walls are filthy. They need to be repainted.',
  ],
});

B.mc({
  q: 'A ___ is a promise from a company to repair a product free of charge for a period of time.',
  o: ['warranty', 'refund', 'receipt', 'discount'],
  a: 0,
  d: 1,
  ex: 'A warranty covers repairs; a refund is money given back.',
  h: [
    'The customer with the crashed computer mentions a three-year one.',
    'warranty = a guarantee of free repair. refund = money returned.',
    'Example: Do you have a warranty? — Yes, I have a three-year warranty.',
  ],
});

B.tf({
  q: 'In the Unit 9 conversation, "flimsy" fabric means fabric that is strong and thick.',
  a: false,
  d: 2,
  ex: 'Flimsy means thin and weak — the mother complains that the material is falling apart.',
  h: [
    'The jeans in the conversation are torn in several places.',
    'flimsy = thin and easily damaged.',
    'Example: It\'s the fabric. It\'s really flimsy.',
  ],
});

B.blk({
  q: 'Complete the compound noun: The car glass at the front is the wind___.',
  a: ['shield'],
  d: 2,
  ex: 'Windshield is a compound noun, and in compound nouns the stress falls on the first part.',
  h: [
    'Think about what the glass does for the driver.',
    'Compound nouns in Unit 9: windshield, windowpane, floorboard, hair dryer.',
    'Example: He hit his head on the windshield.',
  ],
});

B.section('reading', '9 Reading', 'u9-p1');

B.mc({
  q: 'What does Murphy\'s Law state, according to the passage?',
  o: [
    'If anything can go wrong, it might go wrong.',
    'Everything always goes wrong.',
    'Nothing ever goes right.',
    'Bad luck follows good luck.',
  ],
  a: 0,
  d: 1,
  ex: 'The passage states the law in exactly those words, right after the football example.',
  h: [
    'The law is stated in one short sentence with a colon before it.',
    'A colon in a text often introduces a definition.',
    'Example: Murphy\'s Law states: if anything can go wrong, it might go wrong.',
  ],
});

B.mc({
  q: 'How does Robert Matthews explain Murphy\'s Law?',
  o: [
    'Selective memory and the law of probability.',
    'Bad luck follows some people.',
    'Machines are badly made.',
    'People do not plan well.',
  ],
  a: 0,
  d: 2,
  ex: 'He says our selective memories remember bad episodes more readily, and that probability is often against us.',
  h: [
    'The passage says it is neither bad luck nor coincidence — so what is it?',
    'When a text rejects two explanations, the real one comes next.',
    'Example: ...our selective memories tend to remember the bad episodes more readily.',
  ],
});

B.mc({
  q: 'In the supermarket example, what are the chances of choosing the fastest lane out of five?',
  o: ['20 per cent', '50 per cent', '80 per cent', '5 per cent'],
  a: 0,
  d: 2,
  ex: 'One lane in five is 20 per cent, which leaves 80 per cent for a slower lane.',
  h: [
    'The passage gives both numbers in the same sentence.',
    'Percentages in a text are quick to scan for.',
    'Example: ...and 80 percent for a slower lane.',
  ],
});

B.tf({
  q: 'According to the passage, the BBC experiment showed that toast always falls on the buttered side.',
  a: false,
  d: 2,
  ex: 'Half of the pieces fell on the buttered side and half did not, which is the opposite of the popular belief.',
  h: [
    'Read the result of the experiment, not the belief that came before it.',
    'A word like "always" in a true/false statement is worth checking.',
    'Example: Half fell on the buttered side, and half didn\'t.',
  ],
});

B.mc({
  q: 'What is the writer\'s advice in the final paragraph?',
  o: [
    'Do not blame Murphy\'s Law for everything that goes wrong.',
    'Always keep a spare key.',
    'Never take a shower in the morning.',
    'Do not use computers.',
  ],
  a: 0,
  d: 2,
  ex: 'The writer lists three problems that have ordinary causes: a broken heater, waking up late, and having no backup.',
  h: [
    'The last paragraph starts with "Just remember...".',
    'The final paragraph of an article often carries its message.',
    "Example: ...it's your fault for not having a backup of your files.",
  ],
});

B.mc({
  q: 'Who was Captain Edward A. Murphy?',
  o: [
    'an engineer working on equipment to measure heartbeat and breathing',
    'a British physicist',
    'a television presenter',
    'a supermarket manager',
  ],
  a: 0,
  d: 1,
  ex: 'He was an engineer at Edwards Air Force Base in 1949, working on a machine to measure the heartbeat and breathing of pilots.',
  h: [
    'His story is in a separate box at the end of the reading.',
    'Boxes and side notes carry background information.',
    'Example: Murphy blamed the lab technician for the malfunction.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Choose the correct sentence.',
  o: [
    "Yes, I've just washed them.",
    "Yes, I've washed just them.",
    "Yes, just I've washed them.",
    "Yes, I've washed them just.",
  ],
  a: 0,
  d: 2,
  ex: 'Just goes between the auxiliary have and the past participle.',
  h: [
    'Where does the small word sit in relation to "washed"?',
    'already and just go before the past participle; yet goes at the end.',
    "Example: Yes, I've already done them.",
  ],
});

B.mc({
  q: 'Use been or gone: "My sister has ___ to the mall. She will be back at six."',
  o: ['gone', 'been', 'went', 'being'],
  a: 0,
  d: 3,
  ex: 'Gone means the person left and is still there. Been means the person went and has returned.',
  h: [
    'Is she still at the mall, or is she back?',
    'has gone = still there; has been = went and returned.',
    'Example: She has been to Dubai twice.',
  ],
});

B.ord({
  q: 'Rewrite with the pronoun in the right place.',
  c: ['Put', 'them', 'away', '.'],
  d: 1,
  ex: 'With a two-word verb, the pronoun object comes between the verb and the particle.',
  h: [
    'A pronoun never goes after the particle.',
    'Put your clothes away. → Put them away.',
    'Example: Turn it off.',
  ],
});

B.mc({
  q: 'Choose the sentence with the correct object pronoun.',
  o: [
    'Sandra is never on time. I am going to tell her to be more punctual.',
    'Sandra is never on time. I am going to tell she to be more punctual.',
    'Sandra is never on time. I am going to tell they to be punctual.',
    'Sandra is never on time. I am going to tell hers to be punctual.',
  ],
  a: 0,
  d: 1,
  ex: 'After a verb, the object form is used: me, you, him, her, it, us, them.',
  h: [
    'Sandra comes after the verb, so which form of "she" is needed?',
    'Subject pronouns: I, you, he, she, it, we, they. Object pronouns: me, you, him, her, it, us, them.',
    'Example: We need to invite our friends. I can ask them.',
  ],
});

B.blk({
  q: 'Complete with a gerund: They stop ___ tennis in the winter. (play)',
  a: ['playing'],
  d: 1,
  ex: 'Stop is one of the verbs followed by a gerund.',
  h: [
    'Check the list of gerund verbs in the unit.',
    'avoid, enjoy, finish, give up, hate, keep, miss, mind, stop, suggest + verb-ing.',
    'Example: We miss being with our friends.',
  ],
});

B.err({
  t: ['I', 'like', 'helping', 'my', 'mother', 'and', 'I', 'need', 'buying', 'some', 'snacks', '.'],
  a: 8,
  fix: 'to buy',
  d: 3,
  ex: 'Need takes the full infinitive, even though like can take either form.',
  h: [
    'Two verbs in this sentence take an object. Only one of them takes -ing.',
    'need / want + to + base verb.',
    'Example: She needs to buy some snacks.',
  ],
});

export const unit09: Unit = {
  id: 'unit-9',
  number: 9,
  title: 'Complaints, Complaints',
  pages: '134–147',
  functions: [
    'Talk about problems and things that need to be done',
    'Ask to have something done',
    'Talk about common consumer complaints',
  ],
  grammar: [
    'Needs to be (done)',
    'Have/get something (done)',
    'Past participles as adjectives',
    'Present perfect with already, yet, just',
    'Verb + gerund; verb + infinitive',
    'Subject and object pronouns; imperatives and two-word verbs',
  ],
  passages: [
    {
      id: 'u9-p1',
      unitId: 'unit-9',
      title: "Murphy's Law",
      source: 'Written for Torches, based on the Unit 9 reading (Student Book pages 140–141).',
      paragraphs: [
        'You invite your friends over to watch a final football match on television. There are plenty of juices in the refrigerator, bowls of your favourite snacks on the table, and you are all set for the big match. You turn on the television, and all you get are fuzzy images on the screen. Could this be Murphy\'s Law at work? Murphy\'s Law states: if anything can go wrong, it might go wrong.',
        'Similar situations happen all the time. When you are in a hurry to open the door and you try several keys, the last remaining key is usually the one that works. When you are late meeting your friends, all the traffic lights are red. When you get in a line at the supermarket, you find you have chosen the slowest one.',
        'Is this bad luck or coincidence? According to the British physicist Robert Matthews, it is neither. He explains that our selective memories tend to remember the bad episodes more readily than the things that work out. Also, the law of probability is more against us than in our favour. For example, in a supermarket with five cashiers, the chances of getting the fastest lane are 20 per cent, and 80 per cent for a slower lane.',
        'Matthews became a popular scientist when he proved that a piece of toast does not necessarily fall on the buttered side. BBC Television gathered 300 people to throw pieces of buttered toast into the air and observe which side they fell on. Half fell on the buttered side, and half did not.',
        'Just remember that you cannot blame Murphy\'s Law for everything that goes wrong. If the hot water runs out while you are taking a shower, it is probably because the water heater needs to be fixed. If you miss the bus and are late for school, it is probably because you did not wake up early enough. And if you lose all your files on the computer, let us be honest — it is your fault for not having a backup.',
        'Captain Edward A. Murphy, Jr. was an engineer at Edwards Air Force Base in the United States. In 1949 he was working on a machine to measure the heartbeat and breathing of pilots. Something was malfunctioning in the equipment as the result of human error, and Murphy blamed the lab technician, saying that if there was any way to do it wrong, he would. His phrase became popular in all areas to explain the failures of everyday things.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Needs to be done / have something done',
      rule: 'Use needs to be + past participle when something requires a service. Use have or get + object + past participle when somebody else does the service for you.',
      examples: [
        'The windows need to be cleaned.',
        "We're having the rooms decorated.",
        'We had the house painted.',
      ],
    },
    {
      skill: 'grammar',
      title: 'Already, yet, just',
      rule: 'Use the present perfect for recently completed actions. Already and just go before the past participle; yet goes at the end of questions and negatives.',
      examples: [
        "Have you done the dishes yet? — Yes, I've already done them.",
        "No, I haven't washed them yet.",
      ],
    },
    {
      skill: 'form',
      title: 'Gerund or infinitive?',
      rule: 'Some verbs are followed by a gerund (avoid, enjoy, finish, give up, hate, keep, miss, mind, stop, suggest, can\'t stand). Need, want and like are followed by the full infinitive.',
      examples: [
        "He can't stand waiting in line.",
        'She needs to buy some snacks.',
      ],
    },
  ],
  questions: B.done(),
};
