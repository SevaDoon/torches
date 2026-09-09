import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-3');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'In one hundred years, people ___ on other planets.',
  o: ['will live', 'lived', 'are living', 'have lived'],
  a: 0,
  d: 1,
  ex: 'Will is used to make predictions about the future.',
  h: [
    '"In one hundred years" points forward, not back.',
    'Use will or be going to to make predictions about the future.',
    'Example: Computers will perform many functions.',
  ],
});

B.mc({
  q: 'Cars ___ on gasoline in the future.',
  o: ["won't run", "don't run", "didn't run", "aren't running"],
  a: 0,
  d: 1,
  ex: 'The negative of will is will not, contracted to won\'t.',
  h: [
    'You need the negative of the future prediction form.',
    "won't = will not.",
    "Example: Computers won't have feelings.",
  ],
});

B.mc({
  q: 'A: What are your vacation plans? B: ___ a month in Abha. (the plan is already decided)',
  o: ["I'm going to spend", "I'll spend", 'I spend', 'I spent'],
  a: 0,
  d: 2,
  ex: 'Be going to expresses a plan that has already been made. Will is for uncertainty or decisions made while speaking.',
  h: [
    'Has this plan already been decided, or is it being decided right now?',
    'Be going to = a plan already made. Will = uncertainty, often with maybe or probably.',
    'Example: Maybe I\'ll go to Abha. / I\'m going to spend a month in Abha.',
  ],
});

B.mc({
  q: "We don't have any milk. ___ some from the store.",
  o: ["I'll get", "I'm getting", 'I get', 'I got'],
  a: 0,
  d: 2,
  ex: 'Will is used for a decision made at the moment of speaking, such as an offer or a promise.',
  h: [
    'The speaker has only just decided, as they are talking.',
    'Use will for offers and promises decided at the time of speaking.',
    "Example: That bag looks heavy. I'll carry it for you.",
  ],
});

B.ord({
  q: 'Build the future progressive sentence.',
  c: ['At this time tomorrow,', "I'll", 'be', 'swimming', 'in the ocean', '.'],
  d: 2,
  ex: 'The future progressive is will + be + the -ing form, and it describes a continuous action at a future moment.',
  h: [
    'Three words come between "I" and "swimming".',
    'Future progressive = will + be + verb-ing.',
    'Example: By the year 3000, people will be living to the age of 120.',
  ],
});

B.mc({
  q: '___ you be working on the weekend?',
  o: ['Will', 'Do', 'Are', 'Did'],
  a: 0,
  d: 1,
  ex: 'The future progressive question starts with will, then the subject, then be + -ing.',
  h: [
    'Look at the words "be working" — which auxiliary do they need?',
    'Future progressive question: Will + subject + be + verb-ing.',
    'Example: Will you be working on the weekend? — Yes, I will.',
  ],
});

B.mc({
  q: 'Q: When are they flying to Dubai? A: ___',
  o: ["They're flying to Dubai tonight.", 'They fly to Dubai tonight.', 'They flew to Dubai tonight.', 'They will flying tonight.'],
  a: 0,
  d: 2,
  ex: 'The present progressive is used for arrangements and scheduled events in the future.',
  h: [
    'A flight tonight is a fixed arrangement, not a guess.',
    'The present progressive can talk about future arrangements and scheduled events.',
    "Example: When are the new cars coming out? — They're coming out next year.",
  ],
});

B.mc({
  q: 'Global warming will melt the ice at the poles, ___?',
  o: ["won't it", 'will it', "doesn't it", 'is it'],
  a: 0,
  d: 2,
  ex: 'An affirmative sentence takes a negative tag, using the same auxiliary and a subject pronoun.',
  h: [
    'The main sentence is positive. What must the tag be?',
    'Affirmative sentence → negative tag. Negative sentence → affirmative tag.',
    "Example: You are from Riyadh, aren't you?",
  ],
});

B.mc({
  q: "People won't live on other planets in 100 years, ___?",
  o: ['will they', "won't they", 'do they', 'are they'],
  a: 0,
  d: 2,
  ex: 'A negative sentence takes an affirmative tag with the same auxiliary and a subject pronoun.',
  h: [
    'The main sentence already contains a negative.',
    'Negative sentence → affirmative tag.',
    "Example: He isn't working at the research centre tomorrow, is he?",
  ],
});

B.err({
  t: ['It', "doesn't", 'usually', 'rain', 'in', 'summer,', "doesn't", 'it', '?'],
  a: 6,
  fix: 'does',
  d: 3,
  ex: 'The main clause is negative, so the tag has to be affirmative.',
  h: [
    'Count the negatives. Can both halves be negative?',
    'A negative sentence needs an affirmative tag.',
    "Example: It doesn't usually rain in summer, does it?",
  ],
});

B.mc({
  q: 'Choose the correct way to make a suggestion.',
  o: ["Why don't we design a robot to help with the cleaning?", 'Why we don\'t design a robot?', 'Why not we design a robot?', 'Why we design not a robot?'],
  a: 0,
  d: 2,
  ex: "Why don't we ...? is one of the fixed ways of making a suggestion, along with Let's ... and How about ...?",
  h: [
    'Compare the word order in each option with the one you have heard before.',
    "Suggestions: Let's ... / How about ...-ing? / Why don't we ...?",
    "Example: How about making a time capsule for the school project?",
  ],
});

B.blk({
  q: 'How about ___ a time capsule for the school project? (make)',
  a: ['making'],
  d: 2,
  ex: 'How about is followed by a gerund, the -ing form of the verb.',
  h: [
    'What form of the verb follows "about"?',
    'How about + verb-ing.',
    'Example: How about going to the Space Show?',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each word from Unit 3 with its meaning.',
  pairs: [
    ['visionary', 'a person who imagines the future'],
    ['skyscraper', 'a very tall building'],
    ['submarine', 'a vessel that travels under water'],
    ['appliance', 'a machine used in the home'],
    ['obsolete', 'no longer used; out of date'],
  ],
  d: 2,
  ex: 'These words all appear in the Unit 3 texts about Jules Verne and the Tulsa time capsule.',
  h: [
    'Clear the pair you are sure of first.',
    'Long words often contain a smaller word you already know.',
    'Example: sky + scraper = a building that seems to scrape the sky.',
  ],
});

B.mem({
  q: 'Find the pairs: a 1955 prediction and whether it came true.',
  pairs: [
    ['Fast food restaurants will never catch on', 'wrong — they became huge'],
    ['Sports stars will earn more than the president', 'right — they earn millions'],
    ['Kitchen appliances will be electric', 'right — almost all of them are'],
    ['$1,500 will not even buy a used car', 'right — prices rose sharply'],
  ],
  d: 3,
  ex: 'The unit uses these 1955 comments to practise the language of prediction.',
  h: [
    'Turn one card and read it as a prediction. Then look for the result.',
    'A prediction can be right or wrong. The result card tells you which.',
    'Example: "I seriously doubt that fast food restaurants will ever catch on."',
  ],
});

B.mc({
  q: 'People call Jules Verne a ___ because many of the inventions he imagined became reality.',
  o: ['visionary', 'character', 'prediction', 'novel'],
  a: 0,
  d: 1,
  ex: 'A visionary is a person who can imagine what the future will be like.',
  h: [
    'The word contains "vision".',
    'Visionary = a person with a clear picture of the future.',
    'Example: All successful changes start with a vision.',
  ],
});

B.mc({
  q: 'In the Unit 3 conversation, the door of the intelligent house will open with a touch of your finger because the system will ___ your fingerprint.',
  o: ['recognize', 'activate', 'optimize', 'monitor'],
  a: 0,
  d: 2,
  ex: 'To recognize is to know something again when you meet it a second time.',
  h: [
    'The system has to know your finger from before.',
    'Recognize = know again.',
    'Example: The system will recognize your fingerprint.',
  ],
});

B.tf({
  q: 'Real Talk: "No kidding?" is used to express surprise.',
  a: true,
  d: 1,
  ex: 'No kidding? expresses surprise — in the Unit 3 conversation, pleasant surprise about the cleaning robot.',
  h: [
    'Think about the reporter hearing about a robot that does all the housework.',
    'No kidding? = an expression of surprise.',
    'Example: No kidding? Can I buy the robot without the house?',
  ],
});

B.blk({
  q: 'The house will come ___ with a robot that will do the cleaning. (supplied with)',
  a: ['equipped'],
  d: 3,
  ex: 'To be equipped with something is to be supplied with the equipment needed.',
  h: [
    'The word comes from "equipment".',
    'Equipped with = supplied with.',
    'Example: The lab is equipped with new microscopes.',
  ],
});

B.section('reading', '9 Reading', 'u3-p1');

B.mc({
  q: 'Why did the city leaders of Tulsa bury the car?',
  o: [
    'to show the world in 50 years how people lived in 1957',
    'to protect it from a nuclear attack',
    'because nobody wanted to buy it',
    'to test whether cars can survive underground',
  ],
  a: 0,
  d: 1,
  ex: 'The leaders said the car would be unearthed in exactly 50 years to show who they were and how they lived in Tulsa in 1957.',
  h: [
    'The reason is given in the words the city leaders said out loud.',
    'When a text quotes someone, the quote often holds the answer.',
    'Example: "In exactly 50 years time, this car will be unearthed..."',
  ],
});

B.mc({
  q: 'Why were five gallons of gas buried with the car?',
  o: [
    'in case gasoline was no longer available in 2007',
    'to keep the engine warm',
    'because the tank was empty',
    'as a prize for the winner',
  ],
  a: 0,
  d: 2,
  ex: 'The organizers thought the combustion engine might be obsolete by 2007 and that no fuel would be available.',
  h: [
    'Look for the phrase "in case" in the passage.',
    '"In case" always introduces a reason for a precaution.',
    'Example: Take an umbrella in case it rains.',
  ],
});

B.tf({
  q: 'According to the passage, everything inside the car was in perfect condition when the vault was opened.',
  a: false,
  d: 1,
  ex: 'The vault let in moisture, so the car was covered in rust and the handbag contents looked like rotted leather. Only a few items, such as the flag and some documents, were in good shape.',
  h: [
    'Read the paragraph about 2007 carefully — it mentions both bad news and good news.',
    'A true/false statement with a strong word such as "everything" is often false.',
    'Example: "Unfortunately the tomb was unable to protect the car from moisture."',
  ],
});

B.mc({
  q: 'Choose the meaning of "to witness" as it is used in the passage.',
  o: ['to see an event', 'to give evidence in court', 'to help', 'to organize'],
  a: 0,
  d: 2,
  ex: 'The crowd gathered to witness the burial — that is, to see it happen.',
  h: [
    'What did the crowd actually do outside the courthouse?',
    'Guess the meaning from what people in the sentence are doing.',
    'Example: Thousands of people watched as the car was raised.',
  ],
});

B.mc({
  q: 'Choose the meaning of "obsolete" as it is used in the passage.',
  o: ['out of date', 'complete', 'high-tech', 'expensive'],
  a: 0,
  d: 2,
  ex: 'The organizers thought the combustion engine might be obsolete — no longer used — by 2007.',
  h: [
    'They were worried the engine would belong to the past.',
    'Obsolete = no longer used, out of date.',
    'Example: Film cameras became almost obsolete.',
  ],
});

B.mc({
  q: 'What is the good news at the end of the passage?',
  o: [
    'Teddy and Gene were still alive to see the car unearthed',
    'The car started immediately',
    'The microfilm with the names was found',
    "The woman's handbag was undamaged",
  ],
  a: 0,
  d: 2,
  ex: 'Both men had doubted that they would live to see it, and both were there in 2007.',
  h: [
    'The last paragraph starts with "The good news is...".',
    'Writers often signal the ending with a phrase like "the good news is".',
    'Example: They never thought they would be here to see it happen.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Omar lives in Riyadh and works for a computer company. Right now he ___ an exhibit at the Al Qassim Science Center.',
  o: ['is creating', 'creates', 'created', 'will create'],
  a: 0,
  d: 2,
  ex: 'Living and working are permanent; creating the exhibit is a temporary situation happening now.',
  h: [
    '"Right now" changes which tense the second half needs.',
    'Simple present = habits and routines. Present progressive = now or temporary.',
    'Example: He is creating an exhibit named "Computers in the Future".',
  ],
});

B.mc({
  q: 'Which sentence uses will with uncertainty?',
  o: [
    "I'll probably go to the new science museum.",
    "I'm going to the science museum at nine.",
    'I went to the science museum.',
    'I go to the science museum every week.',
  ],
  a: 0,
  d: 2,
  ex: 'Will is often used with probably or maybe to show that the speaker is not certain.',
  h: [
    'One word in the correct sentence shows doubt.',
    'We often use will with probably or maybe to express doubt.',
    "Example: Maybe I'll drive.",
  ],
});

B.ord({
  q: 'Build the future information question.',
  c: ['What', 'are', 'you', 'going to do', 'in the summer', '?'],
  d: 1,
  ex: 'An information question with be going to keeps the order: question word + be + subject + going to + verb.',
  h: [
    'The verb "are" has to move in front of "you".',
    'Wh- + be + subject + going to + base verb.',
    'Example: Where will you go?',
  ],
});

B.mc({
  q: 'Scientists are close to finding a cure for cancer, ___?',
  o: ["aren't they", 'are they', "don't they", "isn't it"],
  a: 0,
  d: 2,
  ex: 'The tag repeats the auxiliary from the main clause and turns it negative, with a matching subject pronoun.',
  h: [
    'Find the auxiliary verb in the main sentence and reuse it.',
    'A tag question uses an auxiliary verb + a subject personal pronoun.',
    "Example: Most people use their cars, don't they?",
  ],
});

B.blk({
  q: 'A: Let\'s go to the Space Show. B: Great ___! Let\'s do it.',
  a: ['idea'],
  d: 1,
  ex: '"Great idea!" is one of the fixed positive responses to a suggestion in the unit.',
  h: [
    'The unit lists a few short ways to accept a suggestion.',
    'Responses to suggestions: Great idea! / Yes, why not! / That sounds great!',
    'Example: How about making a time capsule? — Great idea!',
  ],
});

B.err({
  t: ['At', 'this', 'time', 'tomorrow', 'I', 'will', 'swimming', 'in', 'the', 'ocean', '.'],
  a: 6,
  fix: 'be swimming',
  d: 3,
  ex: 'The future progressive needs the word be between will and the -ing form.',
  h: [
    'Say the sentence aloud. One small word is missing after "will".',
    'Future progressive = will + be + verb-ing.',
    'Example: A week from today, I will be relaxing on the beach.',
  ],
});

export const unit03: Unit = {
  id: 'unit-3',
  number: 3,
  title: 'What Will Be, Will Be',
  pages: '34–47',
  functions: [
    'Make predictions about the future',
    'Express opinions',
    'Make and respond to suggestions',
  ],
  grammar: [
    'Future with will or be going to',
    'Will versus be going to',
    'Future progressive',
    'Present progressive for the future',
    'Wh- questions and tag questions',
  ],
  passages: [
    {
      id: 'u3-p1',
      unitId: 'unit-3',
      title: 'The Tulsa Time Capsule',
      source: 'Written for Torches, based on the Unit 3 reading (Student Book pages 40–41).',
      paragraphs: [
        'A crowd of people gathered outside the courthouse in Tulsa, Oklahoma, in June 1957, to witness the burial of an unusual time capsule: a brand-new gold-and-white Plymouth Belvedere car. The city leaders explained that in exactly fifty years the car would be unearthed to show the world who they were and how they lived in Tulsa in 1957.',
        'The car contained a flag, a city phone directory, an unpaid parking ticket and the contents of a woman\'s purse. Five gallons of gas were also included, in case the combustion engine became obsolete by 2007 and no fuel was available.',
        'The event attracted all sorts of people. Some thought that the idea of burying a new car was foolish; others thought it was brilliant. Raffle tickets were sold, and the person who guessed the population of Tulsa in 2007 would win the car. "I\'ll never be alive," said Teddy Baxter, aged six. "Sure you will," answered his brother Henry, who was nineteen.',
        'The Plymouth was wrapped in protective materials and lowered into a concrete vault that was supposed to withstand even a nuclear attack. It lay there for fifty years. On 13 June 2007 the vault was opened and the car was raised as thousands of people watched. Unfortunately the tomb was unable to protect the car from moisture, and the vintage vehicle was covered in rust. The contents of the handbag looked like a lump of rotted leather, and the microfilm recording the names of the contestants was never found. Some items, however, were in good shape, including a flag, aerial maps of the city and postcards.',
        'The good news is that when the Belvedere was unearthed, Teddy and Gene were still alive. They had never thought they would be there to see it happen.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Will or be going to?',
      rule: 'Use be going to for a plan that is already decided. Use will for uncertainty (often with maybe or probably) and for decisions made at the moment of speaking.',
      examples: [
        "I'm going to spend a month in Abha.",
        "Maybe I'll go to Abha.",
        "We don't have any milk. I'll get some from the store.",
      ],
    },
    {
      skill: 'grammar',
      title: 'Future progressive',
      rule: 'Use will + be + the -ing form for a continuous action at a moment in the future.',
      examples: [
        "At this time tomorrow, I'll be swimming in the ocean.",
        'Will you be working on the weekend? — Yes, I will.',
      ],
    },
    {
      skill: 'form',
      title: 'Tag questions',
      rule: 'A tag question uses an auxiliary verb and a subject pronoun. An affirmative sentence takes a negative tag; a negative sentence takes an affirmative tag.',
      examples: [
        "Global warming will melt the ice at the poles, won't it?",
        "People won't live on other planets in 100 years, will they?",
      ],
    },
  ],
  questions: B.done(),
};
