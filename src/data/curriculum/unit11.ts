import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-11');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'I didn\'t say I was sorry. I ___ sorry.',
  o: ['should have said I was', 'should say I am', 'should saying I was', 'should have say I was'],
  a: 0,
  d: 1,
  ex: 'Should have + past participle expresses a regret about something you did not do.',
  h: [
    'The action is finished, so the form after should has to change.',
    'should have + past participle = regret about the past.',
    "Example: I shouldn't have done that.",
  ],
});

B.mc({
  q: 'If I had studied harder, I ___ the exam.',
  o: ['would have passed', 'would pass', 'will pass', 'had passed'],
  a: 0,
  d: 2,
  ex: 'For a hypothetical situation in the past, use if + past perfect and would have + past participle.',
  h: [
    'Both halves are about the past, and both are imaginary.',
    'if + past perfect, ... would have + past participle.',
    'Example: If I hadn\'t found my book, I would have been in trouble.',
  ],
});

B.mc({
  q: "If I hadn't learned English, I ___ you now.",
  o: ["wouldn't understand", "wouldn't have understood", "won't understand", "don't understand"],
  a: 0,
  d: 3,
  ex: 'When the past condition has a result in the present, use if + past perfect and would + base verb.',
  h: [
    'The word "now" tells you the result belongs to the present, not the past.',
    'if + past perfect, ... would + base verb (present result).',
    'Example: If we had won, we would be celebrating.',
  ],
});

B.mc({
  q: 'If I had got a job last summer, I ___ more money.',
  o: ['could have saved', 'can save', 'could save', 'could have save'],
  a: 0,
  d: 2,
  ex: 'Could have + past participle expresses a missed opportunity in the past.',
  h: [
    'The chance is gone, so the sentence needs a past form.',
    'could / might + have + past participle for missed opportunities.',
    'Example: If she had left work earlier, she might have avoided traffic.',
  ],
});

B.mc({
  q: 'If the Sumerians ___ the wheel, they couldn\'t have moved heavy loads.',
  o: ["hadn't invented", "didn't invent", "haven't invented", "wouldn't invent"],
  a: 0,
  d: 2,
  ex: 'The if-clause of a past hypothetical situation takes the past perfect.',
  h: [
    'Look at the main clause: "couldn\'t have moved". Which if-form matches it?',
    'if + past perfect + could/would have + past participle.',
    'Example: If electricity hadn\'t been discovered, people would still be using candles.',
  ],
});

B.mc({
  q: 'People have had credit cards ___ 1951.',
  o: ['since', 'for', 'ago', 'from'],
  a: 0,
  d: 1,
  ex: 'Since gives the point in time when something began; for gives a length of time.',
  h: [
    'Is 1951 a point in time or a period of time?',
    'since + a point in time; for + a period.',
    'Example: People have had credit cards for over 70 years.',
  ],
});

B.mc({
  q: 'We moved to Muscat three years ___.',
  o: ['ago', 'since', 'for', 'before'],
  a: 0,
  d: 1,
  ex: 'Ago is used with the simple past and gives an exact distance back in time.',
  h: [
    'The verb "moved" is in the simple past, which limits your choice.',
    'Simple past + ago; present perfect + for / since.',
    'Example: We have lived in Muscat since May.',
  ],
});

B.mc({
  q: 'A: When did IBM introduce the first PC? B: ___',
  o: ['It was introduced in 1981.', 'It has been introduced in 1981.', 'It has introduced in 1981.', 'It introduces in 1981.'],
  a: 0,
  d: 2,
  ex: 'When the exact time is given, the simple past is used, not the present perfect.',
  h: [
    'A year is an exact time, and one tense refuses exact times.',
    'Exact time given → simple past. Time unknown or unimportant → present perfect.',
    'Example: Have they discovered life on another planet yet? — Yes, they have.',
  ],
});

B.mc({
  q: '___ you swim when you were a child? — No, I couldn\'t.',
  o: ['Could', 'Can', 'May', 'Would'],
  a: 0,
  d: 1,
  ex: 'Could expresses ability in the past.',
  h: [
    'The sentence ends with "when you were a child".',
    'can = ability now; could = ability in the past.',
    'Example: Could people travel long distances before the airplane? — Yes, they could.',
  ],
});

B.mc({
  q: 'Which is the most formal polite request?',
  o: ['Could you fill in this form, please?', 'Can you fill in this form?', 'Fill in this form.', 'You fill in this form.'],
  a: 0,
  d: 2,
  ex: 'Can and could both make polite requests, and could is more formal.',
  h: [
    'Two of the options are not requests at all.',
    'can and could make polite requests; could is more formal.',
    'Example: Could you open the window? — Certainly.',
  ],
});

B.ord({
  q: 'Build the sentence about a missed opportunity.',
  c: ['If', 'I had studied', 'computer science,', 'I would be able to', 'invent a robot', '.'],
  d: 3,
  ex: 'If + past perfect + would be able to talks about a present ability that was missed in the past.',
  h: [
    'The if-clause comes first, then a comma, then the result.',
    'if + past perfect + would be able to (present ability).',
    'Example: If Dr Fleming had discovered penicillin sooner, doctors would have been able to save more lives.',
  ],
});

B.err({
  t: ['If', 'I', 'would', 'have', 'known', 'it', 'was', 'going', 'to', 'rain,', 'I', 'would', 'have', 'taken', 'an', 'umbrella', '.'],
  a: 2,
  fix: 'had',
  d: 3,
  ex: 'Would have belongs in the main clause only. The if-clause takes the past perfect: if I had known.',
  h: [
    'Count how many times "would have" appears. Should it be there twice?',
    'if + past perfect, ... would have + past participle.',
    'Example: If I had known it was going to rain, I would have taken an umbrella.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each invention with what would have been impossible without it.',
  pairs: [
    ['the wheel', 'moving heavy loads'],
    ['electricity', 'lighting homes without candles'],
    ['the airplane', 'travelling long distances quickly'],
    ['penicillin', 'surviving many infections'],
    ['the computer', 'contacting the whole world from home'],
  ],
  d: 1,
  ex: 'These pairings come from the Unit 11 opening texts about inventions and discoveries.',
  h: [
    'Start with the invention whose text you remember best.',
    'Each text in the unit says what would have been different without the invention.',
    'Example: If people hadn\'t discovered oil, cars that run on gasoline wouldn\'t have become common.',
  ],
});

B.mem({
  q: 'Find the pairs: compound word from Unit 11.',
  pairs: [
    ['oil', 'well'],
    ['heavy', 'load'],
    ['hair', 'style'],
    ['security', 'guard'],
  ],
  d: 1,
  ex: 'These are the word combinations from the Unit 11 Quick Check vocabulary exercise.',
  h: [
    'Turn one card and say it aloud with each possible partner.',
    'A compound is two words that work together as one idea.',
    'Example: electric + bulb = electric bulb.',
  ],
});

B.mc({
  q: 'Choose the meaning of "devastated" as it is used in Unit 11.',
  o: ['extremely upset', 'slightly annoyed', 'very tired', 'surprised'],
  a: 0,
  d: 2,
  ex: 'The letter writer is devastated because he has lost his best friend over 25 dollars.',
  h: [
    'Read the sentence around it: he lost his best friend.',
    'devastated = extremely upset.',
    "Example: I am really devastated. I've lost my best friend.",
  ],
});

B.mc({
  q: 'Choose the meaning of "immature" as it is used in Unit 11.',
  o: ['not yet fully grown up in behaviour', 'not educated', 'unfriendly', 'unlucky'],
  a: 0,
  d: 2,
  ex: 'Faisal says he missed opportunities because he was too immature to listen to his parents.',
  h: [
    'The prefix im- means "not". What is the opposite word?',
    'immature = not behaving in a grown-up way.',
    'Example: I missed some good opportunities because I was too immature.',
  ],
});

B.tf({
  q: 'Real Talk: "breathing down someone\'s neck" means constantly checking on them.',
  a: true,
  d: 1,
  ex: 'Ibrahim uses it to say that Faisal has no boss constantly checking on him.',
  h: [
    'Picture someone standing very close behind you while you work.',
    "breathing down someone's neck = constantly checking on them.",
    "Example: You don't have a boss breathing down your neck.",
  ],
});

B.blk({
  q: 'Complete the expression: to have one\'s mind ___ on something means to be firmly decided.',
  a: ['set'],
  d: 2,
  ex: 'Ibrahim says he had his mind set on a career.',
  h: [
    'The word is short and appears in the Real Talk box.',
    "have one's mind set on something = be firmly decided.",
    'Example: I had my mind set on a career.',
  ],
});

B.section('reading', '9 Reading', 'u11-p1');

B.mc({
  q: 'Why did the writer of the first letter lose his best friend?',
  o: [
    'He asked for his money back in public.',
    'He refused to lend any money.',
    'He bought the wrong shoes.',
    'He forgot the friend\'s birthday.',
  ],
  a: 0,
  d: 2,
  ex: 'The friend said he had been embarrassed at the shop and that the writer should not have asked for the money in public.',
  h: [
    'The reason is given by the friend on the phone, not by the writer.',
    'When two people disagree, read what each of them says.',
    "Example: He said I shouldn't have asked him for the money in public.",
  ],
});

B.mc({
  q: 'How much money in total had the writer lent his friend?',
  o: ['$25', '$20', '$45', '$16'],
  a: 0,
  d: 1,
  ex: 'The DVD and the pizza meal came to twenty-five dollars in total.',
  h: [
    'Scan for the dollar signs in the letter.',
    'Numbers are the easiest details to scan for.',
    'Example: The total, including the DVD, came to $25.',
  ],
});

B.mc({
  q: 'What did the limo driver do when he found the watch?',
  o: [
    'He called the hotel and arranged to return it.',
    'He sold it and bought a limousine.',
    'He kept it as a family heirloom.',
    'He gave it to the police.',
  ],
  a: 0,
  d: 1,
  ex: 'He phoned the hotel where the man was staying, explained what had happened and arranged to return the watch.',
  h: [
    'The second letter tells the events in order.',
    'Narratives give events in the order they happened.',
    'Example: The man was extremely grateful.',
  ],
});

B.tf({
  q: 'According to the passage, the limo driver was completely happy with the reward he received.',
  a: false,
  d: 2,
  ex: 'He was given ten dollars, refused it, and then wrote to the column wondering whether he had done the right thing.',
  h: [
    'Read the last paragraph of the second letter carefully.',
    'The title of the letter — "Honest but wondering why" — is a clue.',
    'Example: Ten bucks! Can you believe it?',
  ],
});

B.mc({
  q: 'What does the writer of the second letter say he could have done with the money?',
  o: [
    'bought his own limousine or started his own business',
    'bought a new watch',
    'moved to another city',
    'paid for a holiday',
  ],
  a: 0,
  d: 2,
  ex: 'He says he has been thinking of what he could have done — buying his own limousine or starting his own business.',
  h: [
    'Look for the phrase "could have" in the letter.',
    'Could have + past participle marks the missed opportunity.',
    'Example: I should have kept the watch.',
  ],
});

B.mc({
  q: 'Why does the writer of the first letter say his advice may be useful to others?',
  o: [
    'because other people may be in similar situations',
    'because he wants to become an advice writer',
    'because his friend reads the column',
    'because the newspaper asked him',
  ],
  a: 0,
  d: 2,
  ex: 'He says it is too late for advice for himself, but the answer might help others in similar situations.',
  h: [
    'The reason is given in the very first paragraph of the letter.',
    'The opening of a letter usually explains why it was written.',
    'Example: Your advice might be useful to others in similar situations.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'A: Have they discovered life on another planet yet? B: ___',
  o: ['Yes, they have.', 'Yes, they did.', 'Yes, they had.', 'Yes, they do.'],
  a: 0,
  d: 1,
  ex: 'The short answer repeats the auxiliary used in the question.',
  h: [
    'Look at the auxiliary verb at the start of the question.',
    'The short answer copies the auxiliary of the question.',
    'Example: Did you see the Roman baths? — Yes, I did.',
  ],
});

B.mc({
  q: 'She ___ her mother last night.',
  o: ["didn't call", "hasn't called", "hadn't called", "doesn't call"],
  a: 0,
  d: 2,
  ex: 'Last night is an exact past time, so the simple past is used.',
  h: [
    'The time expression at the end decides the tense.',
    'Exact time → simple past.',
    "Example: We haven't used our car for a long time.",
  ],
});

B.mc({
  q: 'Excuse me, ___ I open the window? — Yes, you may.',
  o: ['may', 'must', 'would', 'should'],
  a: 0,
  d: 1,
  ex: 'May and can express permission, and may is the more formal of the two.',
  h: [
    'Look at the answer at the end of the sentence.',
    'may / can = permission.',
    'Example: Can I have another soda? — Yes, you can.',
  ],
});

B.mc({
  q: 'Imad ___ stay very long. His friends are waiting for him.',
  o: ["can't", 'may not to', "doesn't can", 'could not to'],
  a: 0,
  d: 2,
  ex: 'The negative of can is can\'t, followed by the base form of the verb.',
  h: [
    'Modal verbs never take "to" and never use "do".',
    "can + not = can't + base verb.",
    'Example: We can\'t meet tomorrow afternoon.',
  ],
});

B.ord({
  q: 'Build the sentence with for.',
  c: ['He', 'has worked', 'as a scientist', 'for', 'many years', '.'],
  d: 1,
  ex: 'For introduces a length of time and pairs with the present perfect.',
  h: [
    'Which word introduces a length of time?',
    'present perfect + for + a period of time.',
    'Example: We have lived in Muscat since May.',
  ],
});

B.blk({
  q: 'Complete the regret: I ___ have listened to my parents. (regret about the past)',
  a: ['should'],
  d: 1,
  ex: 'Should have + past participle expresses a regret about something you did not do.',
  h: [
    'The word comes straight before "have".',
    'should have + past participle = regret.',
    'Example: I should have told the security guard.',
  ],
});

export const unit11: Unit = {
  id: 'unit-11',
  number: 11,
  title: "If It Hadn't Happened",
  pages: '168–181',
  functions: [
    'Talk about discoveries and inventions and how things would have been different',
    'Talk about missed opportunities and regrets',
    'Express ability, permission and requests',
  ],
  grammar: [
    'Should have + past participle',
    'Conditional sentences: hypothetical situations in the past',
    'If with could and might',
    'Present perfect versus simple past',
    'Time expressions with ago, for, since',
    'If + past perfect + be able to; can, could, may',
  ],
  passages: [
    {
      id: 'u11-p1',
      unitId: 'unit-11',
      title: "Mario's Advice Column",
      source: 'Written for Torches, based on the Unit 11 reading (Student Book pages 174–175).',
      paragraphs: [
        'Dear Mario, I am writing to tell you a story. It is too late for you to tell me what to do now, but maybe you could tell me what I should have done. Your advice might be useful to others in similar situations.',
        'My best friend borrowed some money from me two weeks ago when we were out shopping at the mall. I was happy to let him have it, because I had saved my allowance over a few weeks and had more than I needed. He wanted to buy a DVD. Later I lent him some more money because we decided to eat at a pizza restaurant. The total, including the DVD, came to twenty-five dollars. I do not mind helping out a friend, so I did not think much of it.',
        'Last week we were at the mall again and I needed to buy some shoes. They were rather expensive, so I asked him if he could give me some of the money back. He gave me a very strange look, threw a twenty-dollar bill at me, and walked away. I was really upset, so I called him when I got home. He told me he never wanted to have anything to do with me again. He said I had embarrassed him at the shop and that I should not have asked him for the money in public. He thought I had done it on purpose because I did not trust him. I am really devastated. I have lost my best friend over twenty-five dollars. — A Confused Friend',
        'Dear Mario, I am a limo driver, and people leave all kinds of things in my limousine — scarves, packages and even shoes. Last Saturday night I picked up a wealthy man at his hotel and drove him to a charity awards ceremony. The next day, when I was cleaning the inside of the car, I noticed something shining. His gold and diamond pocket watch must have fallen out of his pocket and slipped behind the seat.',
        'So I called the hotel where the man was staying, explained what had happened, and arranged to return the watch. The man was extremely grateful. He told me that it was a valuable family heirloom, given to him by his grandfather, and he praised my honesty. Then he opened his wallet, took out a ten-dollar bill and gave it to me. I refused, but he insisted. Ten dollars! Since then I have been thinking about what I could have done with the money. I could have bought my own limousine or started my own business. Did I do the right thing? — Honest But Wondering Why',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Regrets with should have',
      rule: 'Use should have + past participle to talk about things you wish you had done, and shouldn\'t have + past participle for things you wish you had not done.',
      examples: [
        'I should have said I was sorry.',
        "I shouldn't have done that.",
      ],
    },
    {
      skill: 'grammar',
      title: 'Hypothetical situations in the past',
      rule: 'Use if + past perfect + would have + past participle for a past result. Use if + past perfect + would + base verb when the result is in the present. Could and might replace would for possibilities and missed opportunities.',
      examples: [
        'If I had studied harder, I would have passed the exam.',
        "If I hadn't learned English, I wouldn't understand you.",
        'If I had got a job last summer, I could have saved more money.',
      ],
    },
    {
      skill: 'form',
      title: 'Ago, for and since',
      rule: 'Use the simple past with ago and other exact times. Use the present perfect with for (a period) and since (a starting point).',
      examples: [
        'We moved to Muscat three years ago.',
        'He has worked as a scientist for many years.',
        'We have lived in Muscat since May.',
      ],
    },
  ],
  questions: B.done(),
};
