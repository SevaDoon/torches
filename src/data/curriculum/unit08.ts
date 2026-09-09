import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-8');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'If I ___ a million dollars, I would keep it.',
  o: ['found', 'find', 'will find', 'have found'],
  a: 0,
  d: 1,
  ex: 'For an imaginary present situation, the if-clause takes the simple past and the main clause takes would.',
  h: [
    'Look at the main clause. What tense does "would" pair with?',
    'Imaginary situation: if + simple past, ... would + base verb.',
    "Example: They'd be happy if they had time to take a vacation.",
  ],
});

B.mc({
  q: 'If I had extra money, I ___ take a vacation to Hawaii. (it is only possible)',
  o: ['might', 'will', 'must', 'am going to'],
  a: 0,
  d: 2,
  ex: 'Might replaces would in a conditional sentence to express possibility rather than certainty.',
  h: [
    'The sentence is less certain than "I would take a vacation".',
    'Might can replace would in conditionals to express possibility.',
    'Example: If she had left work earlier, she might have avoided traffic.',
  ],
});

B.mc({
  q: 'If we had more time, we ___ play another game of tennis. (we would be able to)',
  o: ['could', 'can', 'will', 'must'],
  a: 0,
  d: 2,
  ex: 'In the main clause, could means "would be able to".',
  h: [
    'Read the meaning given in brackets and match it to a modal.',
    'In the main clause, could = would be able to. In the if-clause, could = if someone were able to.',
    "Example: If I could travel anywhere, I'd go to Tahiti.",
  ],
});

B.mc({
  q: "I don't have much time. I wish I ___ more time.",
  o: ['had', 'have', 'will have', 'would have'],
  a: 0,
  d: 1,
  ex: 'Wish about the present takes the simple past.',
  h: [
    'The sentence is about now, but the verb form is not.',
    'wish + simple past for the present.',
    'Example: I have to study today. I wish I didn\'t have to study today.',
  ],
});

B.mc({
  q: "He won't lend me his car. I wish he ___ lend me his car.",
  o: ['would', 'will', 'had', 'did'],
  a: 0,
  d: 2,
  ex: 'When you wish that someone would change their behaviour in the future, use wish + would.',
  h: [
    'You want another person to change what they do.',
    'wish + would for the future behaviour of someone else.',
    "Example: I wish my parents would let me go out.",
  ],
});

B.mc({
  q: "I'm not rich. I wish I ___ rich.",
  o: ['were', 'am', 'will be', 'have been'],
  a: 0,
  d: 2,
  ex: 'After wish, the verb be usually becomes were for all subjects, although was is common in informal speech with I.',
  h: [
    'The past form of be after wish has a special polite form.',
    'I wish I were ... (was is also used informally with I).',
    'Example: If I were a very rich person, I wouldn\'t have to work.',
  ],
});

B.ord({
  q: 'Build the conditional sentence.',
  c: ['If I', 'could choose', 'a place to live,', "I'd go", 'to Hawaii', '.'],
  d: 2,
  ex: 'The if-clause comes first and is followed by a comma, then the main clause with would.',
  h: [
    'Which half starts with "If"?',
    'if-clause + comma + main clause with would.',
    "Example: If I found a million dollars, I would keep it.",
  ],
});

B.err({
  t: ['If', 'I', 'will', 'have', 'more', 'money,', 'I', 'would', 'travel', '.'],
  a: 2,
  fix: 'had',
  d: 3,
  ex: 'The if-clause of an imaginary conditional takes the simple past, never will.',
  h: [
    'Two future-looking words cannot both stand in this sentence.',
    'if + simple past, ... would + base verb.',
    'Example: If I had more money, I would travel.',
  ],
});

B.mc({
  q: 'Is there ___ pollution in your city?',
  o: ['any', 'some', 'no', 'a'],
  a: 0,
  d: 1,
  ex: 'Use any in questions and negative statements; use some in affirmative statements.',
  h: [
    'Is this sentence a question, a positive statement, or a negative one?',
    'some → affirmative; any → questions and negatives.',
    'Example: There is some pollution. / There isn\'t any pollution.',
  ],
});

B.mc({
  q: 'Which sentence means the same as "There aren\'t any recycling facilities"?',
  o: [
    'There are no recycling facilities.',
    'There are some recycling facilities.',
    'There is any recycling facility.',
    'There are not some recycling facilities.',
  ],
  a: 0,
  d: 2,
  ex: 'No is used with a positive verb to give a negative meaning: there are no ... = there aren\'t any ...',
  h: [
    'One option keeps the verb positive but still means nothing exists.',
    'There is no crime. = There isn\'t any crime.',
    'Example: There are no libraries and there isn\'t even a book store.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each Unit 8 word with its meaning.',
  pairs: [
    ['philanthropist', 'a person who gives money to help others'],
    ['laureate', 'a person who has won a prize'],
    ['extraterrestrial', 'a being from another planet'],
    ['desert island', 'a small island with nobody living on it'],
    ['split', 'divide between two or more people'],
  ],
  d: 2,
  ex: 'These words appear in the Unit 8 opening texts and in the King Faisal International Prize article.',
  h: [
    'Remove the pair you are sure of first.',
    'A long word often contains a shorter one you know: philanthropist, laureate.',
    'Example: The cash prize was split between them.',
  ],
});

B.mem({
  q: 'Find the pairs: shopping word and its meaning.',
  pairs: [
    ['discount', 'money taken off the normal price'],
    ['cash', 'notes and coins, not a card'],
    ['medium', 'the size between small and large'],
    ['wool', 'a material that comes from sheep'],
  ],
  d: 1,
  ex: 'These words are in the Unit 8 shopping and prices vocabulary chart.',
  h: [
    'Turn one card and keep its word in your head while you search.',
    'The Unit 8 chart divides the words into item, material, size and price.',
    'Example: We have a 20% discount on the red one.',
  ],
});

B.mc({
  q: 'Choose the correct question: "___ is this sweater?"',
  o: ['How much', 'How many', 'How long', 'What size'],
  a: 0,
  d: 1,
  ex: 'How much is used to ask the price.',
  h: [
    'The answer to this question would be a number of riyals.',
    'How much ...? asks the price.',
    'Example: How much are these leather sandals?',
  ],
});

B.mc({
  q: 'Which of these is a noncount noun?',
  o: ['money', 'coin', 'prize', 'wish'],
  a: 0,
  d: 2,
  ex: 'Money, news, information, advice, rice and tea are noncount nouns: they have no plural form and do not take a/an.',
  h: [
    'Try making each word plural. Which one refuses?',
    'Noncount nouns have no plural and do not take a/an.',
    'Example: one coin, two coins — but not "two moneys".',
  ],
});

B.blk({
  q: 'Complete the shop conversation: "Can I ___ you, sir?" — "Yes, please."',
  a: ['help'],
  d: 1,
  ex: 'Can I help you? is the standard opening line of a shop assistant in the Unit 8 dialogue.',
  h: [
    'What does an assistant always say first in a shop?',
    'Can I help you, sir/madam? — Yes, please. I\'m looking for ...',
    'Example: I\'m looking for a sweater for my nephew.',
  ],
});

B.tf({
  q: 'Real Talk: "have a ball" means to have a good time.',
  a: true,
  d: 1,
  ex: 'To have a ball is an informal expression meaning to enjoy yourself very much.',
  h: [
    'Yousef uses it when he describes spending his prize money.',
    'have a ball = have a good time.',
    "Example: I'd buy a house for myself, and a new car, and I'd have a ball.",
  ],
});

B.section('reading', '9 Reading', 'u8-p1');

B.mc({
  q: 'According to the passage, why are most prize winners vulnerable?',
  o: [
    'They are not used to having money or making financial decisions.',
    'They do not want to be famous.',
    'They never tell their families.',
    'They cannot count large numbers.',
  ],
  a: 0,
  d: 2,
  ex: 'The passage says that because they are not used to money, they become easy prey for people who want to take advantage of them.',
  h: [
    'Look for the word "vulnerable" and read the sentence before it.',
    'A cause is often stated in the sentence just before the effect.',
    'Example: They may lose large sums on investments they know nothing about.',
  ],
});

B.mc({
  q: 'What happened to William "Bud" Post after he won?',
  o: [
    'His business ventures failed and he went broke.',
    'He gave everything to charity.',
    'He bought four homes in Spain.',
    'He never spent any of the money.',
  ],
  a: 0,
  d: 2,
  ex: 'His car business and restaurant both failed, and he eventually went broke.',
  h: [
    'Each winner has his own paragraph. Find the one about Post.',
    'When a text describes several people, read only the paragraph you need.',
    'Example: "I wish it never happened. It was totally a nightmare."',
  ],
});

B.mc({
  q: 'How did Bob Bradley use his fortune?',
  o: [
    'He gave it to charities and to his family and friends.',
    'He bought flashy cars and a mansion.',
    'He invested it in a football team.',
    'He kept all of it in the bank.',
  ],
  a: 0,
  d: 1,
  ex: 'He rejected flashy cars, expensive vacations and a luxury mansion, and handed out his money to others.',
  h: [
    'The passage contrasts him with the other two winners.',
    'The word "but" often introduces the person who is different.',
    'Example: "I haven\'t kept any money for myself."',
  ],
});

B.tf({
  q: 'According to the passage, Michael Carroll spent almost his entire fortune in eighteen months.',
  a: true,
  d: 1,
  ex: 'The text lists the homes, cars and the stake in a football team he bought in that time.',
  h: [
    'Scan for the number "18" or the words "18 months".',
    'Numbers and time periods are quick to scan for.',
    'Example: ...four homes, a holiday villa in Spain, two convertible BMWs...',
  ],
});

B.mc({
  q: 'What advice does the passage give at the end?',
  o: [
    'Seek an advisory team to help with financial decisions.',
    'Never enter a competition.',
    'Give all your money to your family.',
    'Buy property immediately.',
  ],
  a: 0,
  d: 2,
  ex: 'The final paragraph advises seeking an advisory team — and a good psychiatrist to keep your sanity.',
  h: [
    'The advice is in the very last sentence.',
    'A conclusion often begins with "So" or "So if...".',
    'Example: So if you ever win a big prize, seek an advisory team.',
  ],
});

B.mc({
  q: 'Choose the meaning of "go broke" as it is used in the passage.',
  o: ['lose all your money', 'break something', 'become ill', 'move house'],
  a: 0,
  d: 2,
  ex: 'The passage says Post went broke and lived on $450 a month afterwards.',
  h: [
    'The sentence after it says how little money he had left.',
    'Use the sentence that follows to test your guess.',
    'Example: He eventually went broke, and now he lives on $450 a month.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'I wish my friend ___ so much junk food.',
  o: ["didn't eat", "doesn't eat", "won't eat", 'not eat'],
  a: 0,
  d: 2,
  ex: 'A wish about a present situation takes the simple past, and the negative is didn\'t + base verb.',
  h: [
    'Turn the present tense back one step.',
    'wish + simple past for the present, including the negative.',
    "Example: I wish that my best friend didn't talk so much.",
  ],
});

B.mc({
  q: 'A friend asked me to go surfing, but I don\'t know how. I wish I ___ surf.',
  o: ['could', 'can', 'will', 'would'],
  a: 0,
  d: 2,
  ex: 'When you wish about an ability you do not have, use wish + could.',
  h: [
    'The sentence is about an ability.',
    "I can't go to the mall. → I wish I could go to the mall.",
    'Example: I wish I could win a big prize.',
  ],
});

B.mc({
  q: 'Which sentence uses "some" correctly?',
  o: [
    'There is some good public transportation.',
    "There isn't some subway system.",
    'Is there some pollution?',
    'There are some no libraries.',
  ],
  a: 0,
  d: 2,
  ex: 'Some belongs in affirmative statements; any belongs in questions and negatives.',
  h: [
    'Three of the options are questions or negatives.',
    'some → affirmative; any → questions and negatives.',
    'Example: There are some good schools but they are very old.',
  ],
});

B.ord({
  q: 'Build the shop question.',
  c: ['How', 'would', 'you', 'like', 'to pay', '?'],
  d: 1,
  ex: 'This is the fixed question used at the till in the Unit 8 dialogue.',
  h: [
    'The auxiliary "would" comes very early in the question.',
    'Wh- + would + subject + like + to + verb.',
    "Example: How would you like to pay? — I'd rather pay in cash.",
  ],
});

B.blk({
  q: 'Complete with a quantifier: There is too ___ traffic and air pollution in my city.',
  a: ['much'],
  d: 2,
  ex: 'Traffic and pollution are noncount nouns, so they take much.',
  h: [
    'Can you count traffic?',
    'much + noncount noun; many + plural count noun.',
    'Example: There is a lot of garbage on the streets.',
  ],
});

B.err({
  t: ['I', 'wish', 'I', 'have', 'more', 'time', 'to', 'study', '.'],
  a: 3,
  fix: 'had',
  d: 2,
  ex: 'After wish, a present situation is expressed with the simple past.',
  h: [
    'Look at the verb straight after the second "I".',
    'wish + simple past for the present.',
    'Example: I wish I had more time.',
  ],
});

export const unit08: Unit = {
  id: 'unit-8',
  number: 8,
  title: 'Wishful Thinking',
  pages: '120–133',
  functions: [
    'Make wishes and talk about imaginary situations',
    'Talk about probability and improbability',
    'Give advice to solve problems; talk about money, shopping and prices',
  ],
  grammar: [
    'Conditional sentences with if-clause: imaginary situations',
    'Conditional sentences with might and could',
    'Verb: wish',
    'Count and noncount nouns',
    'Expressions of quantity: some, any, no',
  ],
  passages: [
    {
      id: 'u8-p1',
      unitId: 'unit-8',
      title: 'Money: A Blessing or a Problem?',
      source: 'Written for Torches, based on the Unit 8 reading (Student Book pages 126–127).',
      paragraphs: [
        'For some people, winning millions is the answer to all their problems, but for others the reality is more like a nightmare. Sudden money can strain relationships with family, friends and neighbours, and it can even end in bankruptcy. It is often very hard for a winner to handle the pressure and all those millions.',
        'Most prize winners are not used to having money or to making financial decisions. They are vulnerable, and they become easy prey to people who want to take advantage of them. Winners may lose large sums on investments they know nothing about, or they may go into business with a partner who does not know how to run a company.',
        'William "Bud" Post won 16.2 million dollars. "I wish it never happened. It was totally a nightmare," he said. He tried to help his family, but things did not work out. He went into a car business and a restaurant with his children, and both ventures failed. He eventually went broke, and afterwards he lived on 450 dollars a month.',
        'Michael Carroll won 9.7 million pounds at the age of twenty. He spent almost his entire fortune in eighteen months on four homes, a holiday villa in Spain, two convertible cars, several quad bikes and a stake in a football team. He had been in trouble with the law before he won, and he continued to be in trouble afterwards, paying thousands of pounds in fines.',
        'But not every winner is like Michael and Bud. Bob Bradley, an eighty-three-year-old great-grandfather, won 6.17 million dollars in May 2006. Besides giving a huge amount to children\'s charities, he spent his fortune helping to make the dreams of his family and friends come true. He rejected flashy cars, expensive vacations and a luxury mansion. "I haven\'t kept any money for myself," he said. "I\'ve had my life more or less, so this win is for their benefit."',
        'So if you ever win a big prize, seek an advisory team to help you make important financial decisions — and keep your feet firmly on the ground.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Imaginary conditionals',
      rule: 'To talk about an imaginary or hypothetical situation in the present, use if + simple past in the if-clause and would + base verb in the main clause. Might expresses possibility; could means "would be able to".',
      examples: [
        'If I found a million dollars, I would keep it.',
        'If I had extra money, I might take a vacation.',
        'If we had more time, we could play another game.',
      ],
    },
    {
      skill: 'grammar',
      title: 'The verb wish',
      rule: 'Use wish for things you want to happen but probably will not. Wish + simple past for the present; wish + could for an ability; wish + would for the future behaviour of somebody else.',
      examples: [
        "I don't have much time. I wish I had more time.",
        "I can't go to the mall. I wish I could go to the mall.",
        "He won't lend me his car. I wish he would lend me his car.",
      ],
    },
    {
      skill: 'form',
      title: 'Some, any, no',
      rule: 'Use some in affirmative statements, and any in negatives and questions. Use no with a positive verb to give a negative meaning.',
      examples: [
        'There is some pollution. / There isn\'t any pollution.',
        'Are there any sport facilities?',
        "There are no libraries. = There aren't any libraries.",
      ],
    },
  ],
  questions: B.done(),
};
