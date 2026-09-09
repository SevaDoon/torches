import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-6');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'Which sentence gives the strongest advice?',
  o: [
    "You'd better take it.",
    'You could take it.',
    'You might take it.',
    'You should take it.',
  ],
  a: 0,
  d: 2,
  ex: 'Had better is stronger than should and ought to. Might and could are the least strong.',
  h: [
    'Put the four forms in order from gentle to strong.',
    'might / could → should → ought to → had better.',
    "Example: You'd better stop eating junk food and exercise more.",
  ],
});

B.mc({
  q: 'You ___ take up a sport, or you could work out with me.',
  o: ['ought to', 'ought', 'ought to to', 'oughts to'],
  a: 0,
  d: 2,
  ex: 'Ought to always keeps the word to before the base verb.',
  h: [
    'One little word always travels with "ought".',
    'ought to + base verb.',
    'Example: You ought to observe speed limits.',
  ],
});

B.mc({
  q: 'Choose the correct negative: "You ___ eat when you\'re driving."',
  o: ["shouldn't", "should not to", 'not should', "doesn't should"],
  a: 0,
  d: 1,
  ex: 'Modal verbs form the negative by adding not directly after them, with no do.',
  h: [
    'Modal verbs never need the helper "do".',
    'should + not = shouldn\'t, followed by the base verb.',
    "Example: You shouldn't give up simply because you were with friends.",
  ],
});

B.mc({
  q: 'Laura has been sick for two days. She ___ see a doctor.',
  o: ["'d better", 'better', 'had better to', 'would better'],
  a: 0,
  d: 2,
  ex: "Had better is contracted to 'd better, and it is followed by the base form of the verb.",
  h: [
    'The full form is two words: had + better.',
    "had better ('d better) + base verb.",
    "Example: You'd better not take it.",
  ],
});

B.mc({
  q: 'I finished reading the book and ___ to the library. (take back)',
  o: ['took it back', 'took back it', 'back took it', 'took it backwards'],
  a: 0,
  d: 2,
  ex: 'With a two-word verb, a pronoun object always goes between the verb and the particle.',
  h: [
    'Where can a pronoun such as "it" stand in a two-word verb?',
    'Pronoun objects go between the verb and the particle.',
    'Example: Did you throw them away?',
  ],
});

B.mc({
  q: 'Which sentence is correct?',
  o: [
    'I threw away the sneakers.',
    'I threw away them.',
    'I away threw the sneakers.',
    'I threw them away the sneakers.',
  ],
  a: 0,
  d: 2,
  ex: 'A noun object can go either between the verb and the particle or after the particle, but a pronoun object must go between them.',
  h: [
    'Look for the option with a pronoun in the wrong place.',
    'Nouns are flexible; pronouns are not.',
    'Example: I threw the sneakers away. / I threw away the sneakers.',
  ],
});

B.mc({
  q: 'Samuel wants to lose weight. He ought to ___ a sport like jogging.',
  o: ['take up', 'turn down', 'put off', 'throw away'],
  a: 0,
  d: 2,
  ex: 'Take up means to begin a new activity.',
  h: [
    'Which of these four means to start something new?',
    'take up = begin. give up = stop. put off = postpone. turn down = refuse.',
    "Example: I'm going to take up karate.",
  ],
});

B.mc({
  q: 'I have to finish my report. Can we ___ our meeting until tomorrow?',
  o: ['put off', 'take up', 'get along with', 'throw away'],
  a: 0,
  d: 2,
  ex: 'Put something off means to postpone it.',
  h: [
    'The meeting is not cancelled — it is moved.',
    'put off = postpone.',
    'Example: They put off the meeting until next week.',
  ],
});

B.mc({
  q: 'My boss is difficult to ___. (accept a bad situation)',
  o: ['put up with', 'put off', 'get along with', 'cut down on'],
  a: 0,
  d: 3,
  ex: 'Put up with is a three-word verb meaning to accept a bad situation.',
  h: [
    'Two of these are three-word verbs. Which one is negative in feeling?',
    'put up with = accept a bad situation. get along with = be friendly with.',
    'Example: We have to put up with our neighbours\' loud voices every night.',
  ],
});

B.ord({
  q: 'Build the advice sentence.',
  c: ['You', 'ought to', 'talk to them', 'and explain', 'that you have work to do', '.'],
  d: 2,
  ex: 'Ought to is followed by the base form of the verb, and the rest of the sentence follows normally.',
  h: [
    'The advice form comes right after the subject.',
    'subject + ought to + base verb + rest.',
    'Example: You ought to take a good road map.',
  ],
});

B.err({
  t: ['He', 'should', 'to', 'give', 'up', 'eating', 'sweets', '.'],
  a: 2,
  fix: '(nothing — remove "to")',
  d: 2,
  ex: 'Should is followed directly by the base form of the verb, with no to. Only ought takes to.',
  h: [
    'One little word does not belong after this modal.',
    'should + base verb (no to). ought to + base verb.',
    'Example: He should also give up eating sweets.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each two- or three-word verb with its meaning.',
  pairs: [
    ['put off', 'postpone'],
    ['give up', 'stop doing'],
    ['take up', 'begin'],
    ['turn down', 'refuse'],
    ['get along with', 'be friendly with'],
  ],
  d: 2,
  ex: 'These are the two- and three-word verbs listed in the Unit 6 grammar box.',
  h: [
    'Match the one you use most often first.',
    'The meaning of a two-word verb is often very different from the two words on their own.',
    'Example: He gave up smoking for health reasons.',
  ],
});

B.mem({
  q: 'Find the pairs: health word and its meaning.',
  pairs: [
    ['anorexia', 'an eating disorder affecting the appetite'],
    ['peer pressure', 'the influence of people your own age'],
    ['nutritious', 'containing what the body needs'],
    ['fitness', 'being in good physical condition'],
  ],
  d: 2,
  ex: 'These four words come from the HelpSite4U texts on the Unit 6 opening pages.',
  h: [
    'Turn one card and keep its word in your head.',
    'Read the health texts in the unit before you play — the definitions come from them.',
    'Example: Younger people tend to eat more junk food because of peer pressure.',
  ],
});

B.mc({
  q: 'Junk food is food that ___.',
  o: [
    'contains a lot of fat and is cooked in an unhealthy way',
    'is always expensive',
    'is cooked at home',
    'contains no sugar',
  ],
  a: 0,
  d: 1,
  ex: 'Unit 6 defines fast food or junk food as food containing a lot of fat and cooked in an unhealthy manner.',
  h: [
    'The unit gives a short definition in the first text.',
    'A definition sentence often uses "refer to" or "means".',
    'Example: The labels fast food or junk food refer to food that contains a lot of fat.',
  ],
});

B.mc({
  q: '"Comfort eating" in the reading means eating ___.',
  o: [
    'because you feel down, not because you are hungry',
    'only comfortable, soft food',
    'in a comfortable restaurant',
    'slowly and carefully',
  ],
  a: 0,
  d: 2,
  ex: 'The reading warns that running to a fast food chain every time you feel down shows the habit is out of control.',
  h: [
    'The word "comfort" here is about feelings, not furniture.',
    'Read the sentence that follows a phrase in quotation marks.',
    'Example: If you run to the nearest fast food chain every time you feel down...',
  ],
});

B.blk({
  q: 'You should keep your principles and your sense of ___-worth. (value you place on yourself)',
  a: ['self'],
  d: 2,
  ex: 'Self-worth is the value a person places on themselves. Unit 6 uses it in the advice about peer pressure.',
  h: [
    'The missing word also appears in "self-esteem".',
    'self-worth = the value you place on yourself.',
    'Example: You deserve healthy and nutritious food.',
  ],
});

B.tf({
  q: 'Real Talk: "feeling down" means feeling depressed.',
  a: true,
  d: 1,
  ex: 'Feeling down is an informal way of saying depressed or sad.',
  h: [
    'Think of Mohammed in the Unit 6 conversation before his exams.',
    'feeling down = feeling depressed.',
    "Example: I'm feeling down. It's all these exams coming up.",
  ],
});

B.section('reading', '9 Reading', 'u6-p1');

B.mc({
  q: 'According to the passage, what is a definite sign that a habit is becoming an addiction?',
  o: [
    'thinking of junk food the moment you feel hungry',
    'eating a salad as a side dish',
    'reading restaurant menus carefully',
    'feeling down for a few days',
  ],
  a: 0,
  d: 2,
  ex: 'The checklist says there is never an acceptable reason for that, and calls it a definite sign of a habit on the way to becoming an addiction.',
  h: [
    'The checklist gives several warning signs. Find the one about hunger.',
    'A checklist is a list of separate items — read each one on its own.',
    'Example: Just ONE warning sign should be enough reason to take action.',
  ],
});

B.tf({
  q: 'According to the passage, breaking a habit can leave you feeling down, and that is quite common.',
  a: true,
  d: 1,
  ex: 'The text says this feeling is common and should not last long if you stick to your decision.',
  h: [
    'Look for the sentence with "Don\'t worry".',
    'A reassuring sentence often follows a warning.',
    'Example: ...and it shouldn\'t last very long if you stick to your decision.',
  ],
});

B.mc({
  q: 'What does the passage advise you to do if a friend insists on offering you junk food?',
  o: [
    'turn down the offer and treat yourself to something nice',
    'accept it and start again tomorrow',
    'stop seeing the friend',
    'eat only half of it',
  ],
  a: 0,
  d: 2,
  ex: 'The advice is to refuse the offer and give yourself a different treat, so that you regain control.',
  h: [
    'Search the bullet points for the word "friend".',
    'Advice texts often use bullet points — one idea per bullet.',
    'Example: The important thing is to regain control.',
  ],
});

B.mc({
  q: 'According to the passage, which is a healthier choice at a fast food restaurant?',
  o: [
    'salad as a side dish instead of a second helping of fries',
    'a larger burger',
    'extra mayonnaise',
    'a second dessert',
  ],
  a: 0,
  d: 1,
  ex: 'The passage says healthier choices exist even in a fast food restaurant, and gives salad instead of extra fries as the example.',
  h: [
    'The word "healthier" appears in the passage — go straight to it.',
    'A comparative such as "healthier" signals a comparison you can quote.',
    'Example: You could avoid condiments such as ketchup or mayonnaise.',
  ],
});

B.mc({
  q: 'What does the passage say about setting goals?',
  o: [
    'they should be achievable and enjoyable',
    'they should be as difficult as possible',
    'they should be set by a doctor',
    'they are not useful',
  ],
  a: 0,
  d: 2,
  ex: 'The last bullet advises setting goals that are achievable and enjoyable, and treating yourself right.',
  h: [
    'Look at the final bullet point of the advice list.',
    'The conclusion of an advice text often contains its most positive line.',
    'Example: Decide what you would like to do again and when.',
  ],
});

B.mc({
  q: 'Choose the meaning of "bland" as it is used in the passage.',
  o: ['without much taste', 'very spicy', 'expensive', 'frozen'],
  a: 0,
  d: 2,
  ex: 'The passage argues that a healthy, nutritious meal does not have to be bland and boring.',
  h: [
    'The word next to it in the passage is "boring".',
    'When two adjectives are joined by "and", they often have similar feeling.',
    'Example: A nutritious meal does not have to be bland and boring.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: '___ water do you drink?',
  o: ['How much', 'How many', 'How long', 'How often'],
  a: 0,
  d: 1,
  ex: 'How much goes with noncount nouns such as water; how many goes with plural count nouns.',
  h: [
    'Can you say "two waters" about the water you drink each day?',
    'How much + noncount noun. How many + plural count noun.',
    'Example: How many sisters do you have?',
  ],
});

B.mc({
  q: '___ hours do you exercise a week?',
  o: ['How many', 'How much', 'How long', 'How far'],
  a: 0,
  d: 1,
  ex: 'Hours can be counted, so how many is used.',
  h: [
    'One hour, two hours — can you count them?',
    'How many + plural count noun.',
    'Example: How much exercise do you do?',
  ],
});

B.mc({
  q: 'I eat ___ vegetables every day, just two or three kinds.',
  o: ['a few', 'a little', 'much', 'a lot of'],
  a: 0,
  d: 2,
  ex: 'A few is used with plural count nouns and means a small number.',
  h: [
    'Vegetables can be counted, and the sentence says the number is small.',
    'a few + plural count noun; a little + noncount noun.',
    'Example: I eat a few green vegetables every day.',
  ],
});

B.mc({
  q: "I don't eat ___ salt. It's not good for you.",
  o: ['much', 'many', 'a few', 'lots'],
  a: 0,
  d: 2,
  ex: 'Much is used with noncount nouns, usually in negative sentences and questions.',
  h: [
    'Salt cannot be counted one by one.',
    'much + noncount noun (mostly negatives and questions); many + plural count noun.',
    "Example: I don't eat much salt.",
  ],
});

B.ord({
  q: 'Build the question with a clause with when.',
  c: ['How', 'do you feel', 'when', 'you', 'exercise', '?'],
  d: 2,
  ex: 'A clause with when adds the situation, and it follows the main question here.',
  h: [
    'The word when introduces the situation, not the question itself.',
    'main clause + when + situation.',
    'Example: What do you do when you have a cold?',
  ],
});

B.blk({
  q: 'What do you do when you have a headache? — I take a ___. (medicine for pain)',
  a: ['painkiller'],
  d: 2,
  ex: 'A painkiller is medicine taken to stop pain, and it is listed in the Unit 6 medicine vocabulary.',
  h: [
    'The word is made of two smaller words you already know.',
    'Medicine words in Unit 6: painkiller, vitamins, cough syrup, cream.',
    'Example: I usually take some aspirin.',
  ],
});

export const unit06: Unit = {
  id: 'unit-6',
  number: 6,
  title: 'Take My Advice',
  pages: '82–95',
  functions: [
    'Discuss common problems',
    'Ask for and give advice',
    'Use words connected with medicine',
  ],
  grammar: [
    'Modal auxiliaries: should, ought to, might, could',
    'Had better',
    'Two- and three-word verbs',
    'Question words: How many, How much',
    'Quantity expressions: much, many, a lot of, lots of, a few, a little',
    'Clauses with when',
  ],
  passages: [
    {
      id: 'u6-p1',
      unitId: 'unit-6',
      title: 'Breaking the Habit — Getting Healthy',
      source: 'Written for Torches, based on the Unit 6 reading (Student Book pages 88–89).',
      paragraphs: [
        'Good eating habits contribute to health and fitness and make you feel strong. If you are very tired, hungry and upset, you may think there is nothing better than a burger with fries or a giant pizza. That is probably true if your brain has got used to the pleasure of junk food. But is it good for you? Does it help you stay fit and control your weight? How do you feel after you have eaten?',
        'Here is a checklist to help you decide whether it is time for you or a friend to change eating habits. Just one warning sign should be enough reason to take action. You should not think of junk food the minute you start feeling hungry. There is never an acceptable reason for that, and it is a definite sign of a habit that is on the way to becoming an addiction. Comfort eating is another sign: if you run to the nearest fast food chain every time you feel down, you know it is out of control. A healthy, nutritious meal does not have to be bland and boring, and there are healthier choices even at a fast food restaurant — you might order a salad as a side dish instead of a second helping of fries, or avoid condiments such as ketchup and mayonnaise.',
        'Breaking a habit can leave you feeling down. Do not worry: this is quite common, and it should not last very long if you stick to your decision to give up junk food.',
        'You ought to decide for yourself whether it is better to cut down on the amount of junk food gradually or to stop altogether for some time. You should allow yourself enough time to do it successfully. You should not give up simply because you joined friends for dinner at a fast food restaurant or helped yourself to a few fries. If a friend insists on offering you junk food, turn down the offer and treat yourself to something nice instead. The important thing is to regain control.',
        'Finally, make a list of all the things you enjoy doing but had to give up because you gained weight or did not feel energetic enough. Decide what you would like to do again, and when. Set yourself goals that are achievable and enjoyable. Treat yourself right.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Giving advice',
      rule: 'Use should, ought to, might and could to give advice. Ought to is stronger than should; might and could are less strong. Had better is the strongest of all.',
      examples: [
        'You should stay. / You ought to stay. / You might stay.',
        "You'd better take it. / You'd better not take it.",
      ],
    },
    {
      skill: 'grammar',
      title: 'Two- and three-word verbs',
      rule: 'The meaning of a two- or three-word verb is often very different from the words on their own. Pronoun objects go between the verb and the particle; noun objects can go either side.',
      examples: [
        'They put off the meeting until next week.',
        'I threw the sneakers away. / I threw away the sneakers. / Did you throw them away?',
      ],
    },
    {
      skill: 'form',
      title: 'How much / how many and quantity',
      rule: 'Use How much with noncount nouns and How many with plural count nouns. Use a little / much with noncount nouns and a few / many with count nouns.',
      examples: [
        'How much exercise do you do? — I go to the gym twice a week.',
        'I eat a few green vegetables every day.',
        "I don't eat much salt.",
      ],
    },
  ],
  questions: B.done(),
};
