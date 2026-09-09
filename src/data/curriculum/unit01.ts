import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-1');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'John lives in Quebec, but he ___ in France this year.',
  o: ['is studying', 'studies', 'studied', 'has studied'],
  a: 0,
  d: 1,
  ex: 'Living in Quebec is permanent, so it takes the simple present. Studying in France is only for this year — a temporary situation — so it takes the present progressive.',
  h: [
    'One part of this sentence is permanent and the other part is only for this year.',
    'Use the simple present for permanent situations, and the present progressive for temporary ones.',
    'Example: She works in a hospital, but she is training in Jeddah this month.',
  ],
});

B.mc({
  q: 'The water ___. Please turn it off.',
  o: ['is boiling', 'boils', 'boiled', 'has boiled'],
  a: 0,
  d: 1,
  ex: 'The water is boiling right now — an action in progress at this moment — so the present progressive is used.',
  h: [
    '"Please turn it off" tells you when this is happening.',
    'Use the present progressive for actions happening now or in progress.',
    'Example: Look! The bus is leaving.',
  ],
});

B.mc({
  q: 'The moon ___ around Earth.',
  o: ['goes', 'is going', 'went', 'has gone'],
  a: 0,
  d: 1,
  ex: 'The orbit of the moon is a permanent fact about the world, and facts take the simple present.',
  h: [
    'Is this true only today, or true always?',
    'Use the simple present for facts and permanent situations.',
    'Example: Water freezes at zero degrees.',
  ],
});

B.mc({
  q: 'The scientists ___ the cause of the problem yet.',
  o: ["don't understand", 'are not understanding', "didn't understand", 'have not been understanding'],
  a: 0,
  d: 2,
  ex: 'Understand is a verb of thinking, and verbs like understand, know, like and want are not normally used in the progressive.',
  h: [
    'Try saying each option aloud. One kind of verb refuses the -ing form here.',
    'Verbs like understand, know, like, want, see and hear are not usually used in the progressive.',
    'Example: I know the answer. (not: I am knowing the answer)',
  ],
});

B.mc({
  q: 'The Russians ___ the first artificial satellite in 1957.',
  o: ['launched', 'have launched', 'launch', 'were launching'],
  a: 0,
  d: 1,
  ex: 'The event began and ended in the past, and the exact year is given, so the simple past is used.',
  h: [
    'Look for the time expression. Does it point to a finished year?',
    'Use the simple past for events that began and ended in the past.',
    'Example: King Abdulaziz regained Riyadh in 1902.',
  ],
});

B.mc({
  q: 'The United States ___ many astronauts into space since 1969, and it continues to do so.',
  o: ['has launched', 'launched', 'launches', 'was launching'],
  a: 0,
  d: 2,
  ex: 'The action started in the past and continues into the present, and "since" signals that, so the present perfect is used.',
  h: [
    'The sentence says the action still continues. Which tense connects the past to now?',
    'Use the present perfect for events that began in the past and continue into the present.',
    'Example: Revenue from oil has been used to develop the economy.',
  ],
});

B.ord({
  q: 'Build the question about the founding of the Kingdom.',
  c: ['When', 'was', 'the Kingdom of Saudi Arabia', 'established', '?'],
  d: 1,
  ex: 'A Wh- question in the past puts the question word first, then the auxiliary verb, then the subject.',
  h: [
    'Which single word must start a Wh- question?',
    'Word order: question word + auxiliary + subject + main verb.',
    'Example: When did you visit Pakistan?',
  ],
});

B.ord({
  q: 'Build the sentence with when.',
  c: ['Hans', 'was walking', 'to college', 'when', 'he saw Saud', '.'],
  d: 2,
  ex: 'The longer, continuous action takes the past progressive, and the short action that interrupts it takes the simple past after "when".',
  h: [
    'One action was long and one action interrupted it. Which one comes first here?',
    'Use when so a longer, continuous action is interrupted by a shorter one.',
    'Example: The family was eating lunch when a visitor arrived.',
  ],
});

B.mc({
  q: 'The people ___ when the earthquake happened.',
  o: ['were sleeping', 'slept', 'have slept', 'sleep'],
  a: 0,
  d: 2,
  ex: 'The sleeping was already in progress when the shorter event interrupted it, so it takes the past progressive.',
  h: [
    'Which of the two actions was already going on before the other one started?',
    'Past progressive + when + simple past: the long action is interrupted by the short one.',
    'Example: The students were waiting for the bus when the rain started.',
  ],
});

B.err({
  t: ['Did', 'Hans', 'grew', 'up', 'in', 'Germany', '?'],
  a: 2,
  fix: 'grow',
  d: 2,
  ex: 'After the auxiliary did, the main verb goes back to its base form. Did already carries the past meaning.',
  h: [
    'Look at the first word of the question and then at the main verb.',
    'In questions with did, the main verb stays in the base form.',
    'Example: Did you watch the documentary? (not: Did you watched)',
  ],
});

B.blk({
  q: 'My grandparents left Greece in 1971 and ___ to Athens. (travel)',
  a: ['travelled', 'traveled'],
  d: 2,
  ex: 'The sentence lists finished past events in order, so every verb in the chain stays in the simple past.',
  h: [
    'The other verb in the sentence tells you which tense the whole chain uses.',
    'Use the simple past for a finished action at a stated past time.',
    'Example: They boarded a train and arrived in Munich two days later.',
  ],
});

B.blk({
  q: 'It is winter here now, and I ___ not seen the sun since I arrived.',
  a: ['have', "have'nt", 'have not'],
  d: 2,
  ex: 'With "since" the action runs from a past point up to now, which is the job of the present perfect: have/has + past participle.',
  h: [
    'The word since tells you the action reaches the present.',
    'Present perfect = have/has + past participle.',
    'Example: I have been here for almost three years.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each word from Unit 1 with its meaning.',
  pairs: [
    ['to affect', 'to produce a change'],
    ['to launch', 'to send into space'],
    ['to take for granted', 'to accept as part of life'],
    ['to establish', 'to set up, to start'],
    ['to host', 'to provide a place for'],
  ],
  d: 1,
  ex: 'These five verbs all appear in the Unit 1 texts about events that changed the world.',
  h: [
    'Start with the pair you are most sure of and remove it from the board.',
    'Read the word inside its sentence in the unit before you choose.',
    'Example: Abu Dhabi hosts its own grand prix — it provides a place for the race.',
  ],
});

B.mem({
  q: 'Find the pairs: global issue and its description.',
  pairs: [
    ['poverty', 'not having enough money to live'],
    ['unemployment', 'not being able to find a job'],
    ['overpopulation', 'too many people for the space'],
    ['pollution', 'harmful substances in air or water'],
  ],
  d: 2,
  ex: 'These are four of the global issues listed in the Unit 1 discussion box.',
  h: [
    'Turn one card, then look for the description that answers it.',
    'Each global issue in the unit has a cause and an effect — the description gives the effect.',
    'Example: endangered species = animals at risk of disappearing.',
  ],
});

B.mc({
  q: 'The UAE dirham, a single national ___, was launched in 1973.',
  o: ['currency', 'federation', 'transmission', 'infrastructure'],
  a: 0,
  d: 1,
  ex: 'Currency is the money used in a country. The other three words appear in the unit but describe a union, a signal, or roads and buildings.',
  h: [
    'The sentence is about money.',
    'Currency = the money system of a country.',
    'Example: The Saudi riyal is the currency of the Kingdom.',
  ],
});

B.mc({
  q: 'King Abdulaziz initiated the building of ___ and set Saudi Arabia on the road to modernization.',
  o: ['infrastructure', 'exploration', 'reunification', 'satellite'],
  a: 0,
  d: 2,
  ex: 'Infrastructure means the roads, water systems, schools and services a country is built on.',
  h: [
    'Which word names the roads, water and power a country needs?',
    'Infrastructure = the basic physical systems of a country.',
    'Example: The country built new roads, ports and hospitals.',
  ],
});

B.tf({
  q: '"To take something for granted" means to be very grateful for it.',
  a: false,
  d: 2,
  ex: 'To take something for granted is to accept it as a normal part of life and stop noticing it.',
  h: [
    'Think about how the unit uses it: satellite TV and the Internet are things we take for granted today.',
    'Take for granted = accept as part of life, without thinking about it.',
    'Example: We take clean water for granted.',
  ],
});

B.mc({
  q: 'Real Talk: which expression is used to introduce a completely new topic?',
  o: ['By the way', 'In fact', 'You see', 'Fit in'],
  a: 0,
  d: 2,
  ex: 'By the way changes the subject. In fact and you see add information, and fit in means to be part of a group.',
  h: [
    'Three of these add to what was just said. One of them moves to something else.',
    'By the way introduces a new topic.',
    'Example: By the way, what do you do?',
  ],
});

B.blk({
  q: 'Saud says he has made lots of friends and he ___ in fine in Germany. (be part of a group)',
  a: ['fits'],
  d: 2,
  ex: 'Fit in means to be accepted as part of a group. The subject is he, so the verb takes -s in the simple present.',
  h: [
    'The Real Talk box of Unit 1 has a two-word expression for belonging.',
    'Fit in = be part of a group.',
    'Example: The new student fits in well with her class.',
  ],
});

B.section('reading', '9 Reading', 'u1-p1');

B.mc({
  q: 'According to the passage, what is the first pillar of the Vision?',
  o: [
    'The status of the Kingdom as the heart of the Arab and Islamic worlds',
    'Becoming a centre for global business',
    'The geographical position of the Kingdom',
    'The ambition of young people',
  ],
  a: 0,
  d: 1,
  ex: 'The passage lists the pillars in order, and the first one is about the Kingdom as the Land of the Two Holy Mosques.',
  h: [
    'Scan for the word "first". The answer sits right beside it.',
    'When a text numbers its ideas, the numbers are your map.',
    'Example: "The second pillar is ..." tells you where idea two begins.',
  ],
});

B.mc({
  q: 'In the passage, "a global hub connecting three continents" means the Kingdom will be ___.',
  o: ['a centre for trade and transport', 'a very large country', 'the end of a trade route', 'a quiet place'],
  a: 0,
  d: 2,
  ex: 'A hub is a centre. The passage uses it for a place that links trade and transport between Asia, Europe and Africa.',
  h: [
    'Read the words just after the phrase — they explain it.',
    'Hub = centre.',
    'Example: The airport is a hub for flights to three continents.',
  ],
});

B.mc({
  q: 'The passage says the real wealth of the country is ___.',
  o: ['its people and their ambition', 'its oil reserves', 'its geographical position', 'its holy sites'],
  a: 0,
  d: 2,
  ex: 'The text contrasts natural resources with the ambition of the people, and says the people are the real wealth.',
  h: [
    'Find the sentence with the word "although". It sets up a contrast.',
    'A sentence with although usually puts the important idea in the second half.',
    'Example: Although the room was small, the view was wonderful.',
  ],
});

B.tf({
  q: 'According to the passage, a thriving economy should build an education system that meets the needs of the market.',
  a: true,
  d: 1,
  ex: 'The second theme in the text links a thriving economy directly to education that matches what the job market needs.',
  h: [
    'Look in the paragraph about the second theme.',
    'Scanning means looking for one specific word, not reading every line.',
    'Example: search for the word "education" and read that sentence only.',
  ],
});

B.mc({
  q: 'Choose the meaning of "vibrant" as it is used in the passage.',
  o: ['strong and active', 'awake', 'quiet', 'expensive'],
  a: 0,
  d: 2,
  ex: 'A vibrant society in the passage is one that is full of life and energy — strong and active.',
  h: [
    'Look at the words around it: a society that enjoys a good life and is proud of its heritage.',
    'Guess an unknown word from the words before and after it.',
    'Example: a vibrant city is busy and full of energy.',
  ],
});

B.mc({
  q: 'Choose the meaning of "diversify" as it is used in the passage.',
  o: ['make more varied', 'make smaller', 'make faster', 'make cheaper'],
  a: 0,
  d: 2,
  ex: 'To diversify the economy is to add different kinds of work to it instead of depending on one source.',
  h: [
    'The word "diverse" hides inside it.',
    'Diversify = make more varied.',
    'Example: The company diversified into food and transport.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Choose the correct short answer. "Did Hans grow up in Germany?"',
  o: ["No, he didn't. He grew up in Dubai.", "No, he doesn't.", 'No, he was not.', "No, he hasn't."],
  a: 0,
  d: 1,
  ex: 'A question with did takes a short answer with did or didn\'t.',
  h: [
    'Look at the auxiliary verb used in the question.',
    'The short answer repeats the auxiliary from the question.',
    'Example: Did they stay in Leipzig? — No, they didn\'t.',
  ],
});

B.mc({
  q: 'Choose the correct time expression: "I went to Pakistan ___."',
  o: ['last month', 'since last month', 'for last month', 'yet'],
  a: 0,
  d: 1,
  ex: 'The simple past takes finished time expressions such as last month, yesterday and in 1932.',
  h: [
    'Which of these expressions points to a finished moment?',
    'Simple past goes with yesterday, last night, last month, in 1932.',
    'Example: We visited the Roman baths yesterday.',
  ],
});

B.ord({
  q: 'Build the past progressive question.',
  c: ['Were', 'they', 'waiting', 'for the bus', '?'],
  d: 1,
  ex: 'The past progressive question puts was/were before the subject, then the -ing form.',
  h: [
    'Which word has to jump in front of the subject to make a question?',
    'Past progressive question: was/were + subject + verb-ing.',
    'Example: Was he sleeping?',
  ],
});

B.err({
  t: ['The', 'students', 'was', 'waiting', 'for', 'the', 'bus', '.'],
  a: 2,
  fix: 'were',
  d: 2,
  ex: 'The subject "the students" is plural, so the past progressive uses were, not was.',
  h: [
    'Count the students. One, or more than one?',
    'Use was with I/he/she/it and were with we/you/they.',
    'Example: They were standing on the platform.',
  ],
});

B.mc({
  q: 'Which sentence correctly uses the present perfect?',
  o: [
    'Have members of your family ever emigrated?',
    'Have members of your family ever emigrate?',
    'Has members of your family ever emigrated?',
    'Did members of your family ever emigrated?',
  ],
  a: 0,
  d: 3,
  ex: 'Present perfect = have/has + past participle, and a plural subject takes have.',
  h: [
    'Check two things: the auxiliary, and the form of the main verb after it.',
    'Present perfect = have/has + past participle.',
    'Example: Have you ever visited Europe?',
  ],
});

B.blk({
  q: 'Complete with the correct verb: Ahmed has a part-time job on Saturdays, but he ___ working today. (not)',
  a: ["isn't", 'is not'],
  d: 2,
  ex: 'Having the job is permanent, but "today" is temporary, so the negative present progressive is used.',
  h: [
    'The word "today" tells you this half of the sentence is only about now.',
    'Negative present progressive: subject + is/are + not + verb-ing.',
    'Example: She is not working this week.',
  ],
});

export const unit01: Unit = {
  id: 'unit-1',
  number: 1,
  title: 'Big Changes',
  pages: '6–19',
  functions: [
    'Discuss past world events and present effects',
    'Talk about global issues',
  ],
  grammar: [
    'Simple present',
    'Simple present and present progressive',
    'Simple past and present perfect',
    'Simple past and past progressive',
    'Past progressive + when + simple past',
  ],
  passages: [
    {
      id: 'u1-p1',
      unitId: 'unit-1',
      title: 'Progress Towards the Future',
      source: 'Written for Torches, based on the Unit 1 reading about Vision 2030 (Student Book pages 12–13).',
      paragraphs: [
        'Every successful change starts with a vision, and a strong vision stands on strong pillars. The first pillar is the status of the Kingdom of Saudi Arabia as the heart of the Arab and Islamic worlds. It is the Land of the Two Holy Mosques, and the country will keep expanding and developing so that Muslims from every part of the world can visit the Holy Sites.',
        'The second pillar is the determination to become a centre for global business. The economy will be developed so that it encourages investment from other countries and from international companies. The third pillar is the geographical position of the country. It will be transformed into a global hub connecting three continents — Asia, Europe and Africa — and this position will be used to improve trade and transport.',
        'Although the country is rich in natural resources, its real wealth lies in the ambition of its people and in the potential of the younger generation. They are the pride of the nation and the architects of its future, and they will be supported in finding jobs and training.',
        'The vision is built around three themes: a vibrant society, a thriving economy and an ambitious nation. A vibrant society lives by the Islamic principle of moderation, is proud of its national identity and its ancient cultural heritage, and is supported by a social and health care system. A thriving economy provides opportunities for everybody by building an education system that meets the needs of the market, and it will diversify so that new jobs are created. An ambitious nation is built on a responsible, transparent and high-performing government.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Simple present or present progressive?',
      rule: 'Use the simple present for facts, permanent situations, habits and routines. Use the present progressive for actions happening now, in progress, or temporary.',
      examples: [
        'John lives in Quebec, but he is studying in France this year.',
        'The moon goes around Earth.',
        'The water is boiling. Please turn it off.',
      ],
    },
    {
      skill: 'grammar',
      title: 'Simple past or present perfect?',
      rule: 'Use the simple past for events that began and ended in the past. Use the present perfect for events that began in the past and continue into the present.',
      examples: [
        'The Russians launched the first artificial satellite in 1957.',
        'The United States has launched many astronauts into space since 1969.',
      ],
    },
    {
      skill: 'form',
      title: 'Past progressive + when + simple past',
      rule: 'Use when to show that a longer, continuous action was interrupted by a shorter one. The long action takes the past progressive; the short one takes the simple past.',
      examples: [
        'Hans was walking to college when he saw Saud.',
        'The family was eating lunch when a visitor arrived at the house.',
      ],
    },
  ],
  questions: B.done(),
};
