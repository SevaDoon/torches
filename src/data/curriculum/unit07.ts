import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-7');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'I apologized ___ her graduation day.',
  o: ['for forgetting', 'for forget', 'to forget', 'of forgetting'],
  a: 0,
  d: 1,
  ex: 'Apologize takes the preposition for, and a verb after a preposition takes the -ing form.',
  h: [
    'Two things to check: which preposition, and which form of the verb.',
    'Preposition + gerund: after a preposition the verb takes -ing.',
    'Example: I apologize for arriving late.',
  ],
});

B.mc({
  q: 'I look forward ___ you personally.',
  o: ['to meeting', 'to meet', 'for meeting', 'meeting'],
  a: 0,
  d: 3,
  ex: 'In look forward to, the word to is a preposition, not part of an infinitive, so it is followed by the -ing form.',
  h: [
    'This is the classic trap: the word "to" here is not part of an infinitive.',
    'look forward to + verb-ing.',
    'Example: I\'m really looking forward to seeing you again.',
  ],
});

B.mc({
  q: 'I insist ___ for our lunch.',
  o: ['on paying', 'to pay', 'in paying', 'for paying'],
  a: 0,
  d: 2,
  ex: 'Insist takes the preposition on, followed by the -ing form.',
  h: [
    'Each verb keeps its own preposition. Which one goes with insist?',
    'insist on + verb-ing; succeed in + verb-ing; decide against + verb-ing.',
    'Example: I insist on your coming.',
  ],
});

B.mc({
  q: '___ it rained, we enjoyed the vacation.',
  o: ['Although', 'In spite of', 'Because', 'So'],
  a: 0,
  d: 2,
  ex: 'Although and even though introduce a clause with a subject and a verb. In spite of is followed by a noun or a gerund.',
  h: [
    'Look at what comes next: a full clause, or just a noun?',
    'although / even though + clause; in spite of + noun or gerund.',
    'Example: In spite of the traffic, I arrived on time.',
  ],
});

B.mc({
  q: 'He went to school ___ being sick.',
  o: ['in spite of', 'although', 'even though', 'because'],
  a: 0,
  d: 2,
  ex: 'In spite of is followed by a noun or a gerund — here, the gerund "being".',
  h: [
    'The word after the gap ends in -ing, and it has no subject.',
    'in spite of + noun / gerund.',
    'Example: Even though I was tired, I couldn\'t sleep.',
  ],
});

B.mc({
  q: "I'll tell you as soon as I ___.",
  o: ['know', 'will know', 'knew', 'am knowing'],
  a: 0,
  d: 2,
  ex: 'After as soon as and when, we use the present even though we are talking about the future.',
  h: [
    'The main clause already carries the future meaning.',
    'Conjunctions of time (as soon as, when) are not followed by future forms.',
    "Example: I'll call you when I arrive.",
  ],
});

B.mc({
  q: 'There were ___ cars that we couldn\'t find a place to park.',
  o: ['so many', 'so much', 'such many', 'too many'],
  a: 0,
  d: 2,
  ex: 'Use so with many, much, few and little to express a result: so many cars (that) ...',
  h: [
    'Cars can be counted.',
    'so + many / much / few / little + noun + (that) + result.',
    'Example: The noise was so loud that we could hardly hear ourselves talk.',
  ],
});

B.mc({
  q: 'Morse ___ a professor at New York University. He taught arts and design.',
  o: ['used to be', 'would be', 'use to be', 'was used to be'],
  a: 0,
  d: 2,
  ex: 'Used to describes a past state that is no longer true. Would cannot be used for past states.',
  h: [
    'Being a professor is a state, not a repeated action.',
    'Use used to for past states; would can only replace it for repeated past actions.',
    'Example: People used to have very powerful voices in those days.',
  ],
});

B.mc({
  q: '___ you use to have a blue car? — Yes, I did.',
  o: ['Did', 'Do', 'Were', 'Have'],
  a: 0,
  d: 2,
  ex: 'The question form is did + subject + use to (no d), because did already carries the past.',
  h: [
    'Look at the short answer at the end of the sentence.',
    'Question: Did + subject + use to + base verb.',
    "Example: Did they use to play football every week? — No, they didn't.",
  ],
});

B.err({
  t: ['My', 'grandfather', "didn't", 'used', 'to', 'have', 'a', 'cell', 'phone', '.'],
  a: 3,
  fix: 'use',
  d: 3,
  ex: 'After didn\'t, the form is use to without the -d, because didn\'t already shows the past.',
  h: [
    'The auxiliary already tells you the sentence is in the past.',
    "didn't use to (no -d) / did ... use to ...?",
    "Example: People didn't use to take digital images with their phones.",
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each expression from Unit 7 with its meaning.',
  pairs: [
    ['put someone up', 'let a visitor stay in your home'],
    ['look forward to', 'feel happy about something coming'],
    ['let someone down', 'disappoint them'],
    ['get used to', 'become familiar with something new'],
    ['out of sight', 'not able to be seen'],
  ],
  d: 2,
  ex: 'These expressions come from the emails and the conversation in Unit 7.',
  h: [
    'Start with the expression you have heard most often.',
    'These are fixed expressions — the whole phrase carries the meaning.',
    'Example: I was wondering if you could put me up.',
  ],
});

B.mem({
  q: 'Find the pairs: email word and its meaning.',
  pairs: [
    ['spam', 'unwanted email sent to many people'],
    ['supplier', 'a company that provides goods'],
    ['urgent', 'needing attention immediately'],
    ['inconvenience', 'trouble or difficulty caused to someone'],
  ],
  d: 2,
  ex: 'These four words appear in the Unit 7 emails and vocabulary list.',
  h: [
    'Turn one card and hold the word in your head while you search.',
    'Two of these are nouns, one is an adjective — that helps you sort them.',
    'Example: I don\'t want to inconvenience you in any way.',
  ],
});

B.mc({
  q: 'Melanie writes that she was ___ most of the time in Paris, in spite of her raincoat.',
  o: ['soaked', 'feasible', 'indifferent', 'urgent'],
  a: 0,
  d: 2,
  ex: 'Soaked means completely wet.',
  h: [
    'The sentence mentions rain, a raincoat and an umbrella.',
    'soaked = completely wet.',
    'Example: It was so rainy that I was soaked most of the time.',
  ],
});

B.mc({
  q: 'Which closing is correct for a business email?',
  o: ['Best regards,', 'See you soon,', 'Take care,', 'Bye for now,'],
  a: 0,
  d: 1,
  ex: 'Business and professional emails close formally: Kind regards, Best regards or Sincerely.',
  h: [
    'Three of these sound like a message to a friend.',
    'Formal closings: Kind regards / Best regards / Sincerely.',
    'Example: Best regards, Purchasing Manager.',
  ],
});

B.tf({
  q: 'Real Talk: "No way!" is used to say that you will not allow something.',
  a: true,
  d: 1,
  ex: 'No way! refuses strongly — Abdullah uses it when Ahmed says he cannot come.',
  h: [
    'Think of Abdullah hearing that his friend will miss the graduation.',
    "No way! = used to say you won't allow something.",
    'Example: No way! I refuse to accept that.',
  ],
});

B.blk({
  q: 'Be ___ with your uncle, and tell him you have plans. (honest and frank)',
  a: ['straight'],
  d: 3,
  ex: 'To be straight with someone is to be honest and frank with them.',
  h: [
    'The word is in the Real Talk box of Unit 7.',
    'be straight = be honest and frank.',
    'Example: Be straight with your uncle.',
  ],
});

B.section('reading', '9 Reading', 'u7-p1');

B.mc({
  q: 'According to the passage, what did two parallel columns of smoke mean?',
  o: [
    'the successful return of a war party',
    'that a fire was out of control',
    'that a message had been received',
    'that visitors were arriving',
  ],
  a: 0,
  d: 2,
  ex: 'The text gives this as an example of the code that native people in the Americas developed.',
  h: [
    'Look for the phrase "for example" in the paragraph about smoke.',
    'The words "for example" always introduce the detail you need.',
    'Example: They developed a code in which certain combinations had special meanings.',
  ],
});

B.mc({
  q: 'How did the ancient Greeks pass information through the land?',
  o: [
    'by lighting fires on a line of signal towers',
    'by sending runners with letters',
    'by using drums',
    'by using smoke only',
  ],
  a: 0,
  d: 1,
  ex: 'They established lines of signal towers on mountain tops, and at each one a large fire was lit to transmit a signal to the next tower.',
  h: [
    'Find the sentence that mentions the Greeks.',
    'Scan for the name of the people, then read that sentence.',
    'Example: ...a large fire was lit to transmit a signal to the next tower.',
  ],
});

B.mc({
  q: 'What was the first email message, according to the passage?',
  o: ['QWERTYUIOP', 'Hello world', 'Test message 1', 'Keeping in touch'],
  a: 0,
  d: 1,
  ex: 'Ray Tomlinson was testing the system and sent a nonsense message — the top row of an English keyboard.',
  h: [
    'The passage says the message was nonsense, not a real sentence.',
    'A short quotation in a text is usually the exact answer.',
    'Example: This is just the top row of keys on an English-language keyboard.',
  ],
});

B.mc({
  q: 'Why did Tomlinson use the @ sign?',
  o: [
    'to mark messages going to a computer at another site',
    'because it looked friendly',
    'because it was the only free key',
    'to show the message was urgent',
  ],
  a: 0,
  d: 2,
  ex: 'He used it to identify messages that were headed out of the local machine to more distant ones.',
  h: [
    'The sentence with @ explains its job in the same line.',
    'A "why" answer is often in the same sentence as the fact.',
    'Example: That was the start of the emailing systems that we still use today.',
  ],
});

B.tf({
  q: 'According to the passage, drum talk is still used in Central Africa today.',
  a: true,
  d: 1,
  ex: 'The text says a kind of drum talk is still used there, although few people who are not natives can understand it.',
  h: [
    'Find the paragraph about noise and drums.',
    'The word "still" in a text signals something that continues today.',
    'Example: The sender is able to simulate speech with the drums.',
  ],
});

B.mc({
  q: 'What does the passage say about the number of email boxes?',
  o: [
    'It grew from 263 million to over 4 billion.',
    'It has stayed the same since 2000.',
    'It fell after text messaging began.',
    'It was never counted.',
  ],
  a: 0,
  d: 2,
  ex: 'By the end of the 20th century there were 263 million email boxes, and in the 21st century the figure has grown to over 4 billion.',
  h: [
    'Two numbers appear in the last paragraph. Compare them.',
    'When a text gives two numbers, it is usually showing change.',
    'Example: ...the functions of email services will become more and more diversified.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Choose the correct plural: one city, two ___.',
  o: ['cities', 'citys', 'cityes', 'cityies'],
  a: 0,
  d: 1,
  ex: 'A noun ending in a consonant + y drops the y and adds -ies.',
  h: [
    'Look at the letter before the final y.',
    'consonant + y → -ies; vowel + y → just add -s.',
    'Example: company → companies; boy → boys.',
  ],
});

B.mc({
  q: 'Choose the correct plural: one inbox, two ___.',
  o: ['inboxes', 'inboxs', 'inboxies', 'inbox'],
  a: 0,
  d: 1,
  ex: 'Nouns ending in -s, -ch, -sh, -o or -x take -es.',
  h: [
    'Say "inboxs" out loud. Can you hear the problem?',
    'Add -es after -s, -ch, -sh, -o and -x.',
    'Example: business → businesses; watch → watches.',
  ],
});

B.mc({
  q: 'Choose the correct plural: one life, two ___.',
  o: ['lives', 'lifes', 'lifees', 'life'],
  a: 0,
  d: 2,
  ex: 'Most nouns ending in -f or -fe change the ending to -ves.',
  h: [
    'The f changes to another letter.',
    '-f / -fe → -ves.',
    'Example: leaf → leaves; wife → wives.',
  ],
});

B.mc({
  q: 'Choose the irregular plural: one child, two ___.',
  o: ['children', 'childs', 'childes', 'childrens'],
  a: 0,
  d: 1,
  ex: 'Child has an irregular plural: children.',
  h: [
    'This word does not follow any of the -s rules.',
    'Irregular plurals: man/men, woman/women, child/children, tooth/teeth, foot/feet.',
    'Example: The children at the local school got some new computers.',
  ],
});

B.blk({
  q: 'Use the definite article: We use ___ Internet every day.',
  a: ['the'],
  d: 2,
  ex: 'The definite article is used for objects that are one of a kind, such as the Internet, the sun and the Masmak Fortress.',
  h: [
    'How many Internets are there?',
    'Use the for things that are one of a kind.',
    'Example: the sun, the Holy Qur\'an, the Masmak Fortress.',
  ],
});

B.mc({
  q: 'Choose the correct sentence.',
  o: [
    'There are lots of unanswered emails in my inbox.',
    'There is lots of unanswered emails in my inbox.',
    'There are a phone message for you.',
    'There be lots of emails in my inbox.',
  ],
  a: 0,
  d: 2,
  ex: 'There is goes with singular nouns, and there are with plural nouns.',
  h: [
    'Check whether the noun after the gap is singular or plural.',
    'There is + singular noun. There are + plural noun.',
    'Example: There is a phone message for you.',
  ],
});

export const unit07: Unit = {
  id: 'unit-7',
  number: 7,
  title: "You've Got Mail!",
  pages: '106–119',
  functions: [
    'Discuss email and letter format and etiquette',
    'Make and accept an apology',
    'Wish someone success; make arrangements; accept and refuse invitations',
  ],
  grammar: [
    'Preposition + gerund',
    'Although, even though, in spite of',
    'As soon as, when; so … (that)',
    'Used to and would',
    'There is/are; plurals',
    'Definite article: the',
  ],
  passages: [
    {
      id: 'u7-p1',
      unitId: 'unit-7',
      title: 'From Smoke Signals to Email: Keeping in Touch',
      source: 'Written for Torches, based on the Unit 7 reading (Student Book pages 112–113).',
      paragraphs: [
        'From the Stone Age to the present, people have shown a desire to send messages to one another over long distances.',
        'In ancient times, according to one story, a chain of fires on mountaintops was used to carry the news of the fall of Troy to people in Greece. In the past, native people in the Americas used smoke from fires to transmit messages. They developed a code in which certain combinations of rising smoke had special meanings. For example, two parallel columns of smoke indicated the successful return of a war party. The ancient Greeks established lines of signal towers on mountain tops; at each one a large fire was lit to transmit a signal to the next tower, and in this way information was passed on through the land.',
        'Almost anything that makes a noise has been used for signalling. A kind of drum talk is still used in Central Africa today, although few people who are not natives have been able to understand it. The sender uses a drum that can produce a high or a low tone, and because the local dialect alternates in these tones, the sender is able to simulate speech with the drums.',
        'In modern times, people have communicated by letter, telegraph and telephone. But no method has become as widespread as quickly as email. The first email message was sent in 1971, and according to its sender, Ray Tomlinson, it was probably "QWERTYUIOP" — just the top row of keys on an English-language keyboard. He was testing the system with a nonsense message and had no idea that he was starting a revolution in communication.',
        'Tomlinson was one of a group of scientists working on better computers. Scientists at his site could send a message to a mailbox on the computer at that site, and others could view the messages there. His idea was to find a way to deliver messages to mailboxes on remote computers, and he used the @ sign to identify messages that were headed out of the local machine to the more distant ones. That was the start of the email systems we still use today.',
        'At first the number of people using email was small, but by the end of the 20th century there were 263 million email boxes. In the 21st century that figure has grown to over four billion, and the functions of email services will become more and more diversified.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Preposition + gerund',
      rule: 'A verb that follows a preposition takes the -ing form. Many verbs and adjectives keep a fixed preposition: apologize for, insist on, succeed in, look forward to, tired of, used to.',
      examples: [
        'I apologize for arriving late.',
        'I look forward to meeting you personally.',
        "I'm tired of waiting for an answer.",
      ],
    },
    {
      skill: 'grammar',
      title: 'Although, even though, in spite of',
      rule: 'Although and even though introduce a clause with a subject and a verb. In spite of is followed by a noun or a gerund.',
      examples: [
        'Although it rained, we enjoyed the vacation.',
        'In spite of the traffic, I arrived on time.',
        'He went to school in spite of being sick.',
      ],
    },
    {
      skill: 'form',
      title: 'Used to and would',
      rule: 'Use used to for past states, habits and situations that are no longer true. Would can replace used to for past habits, but never for past states. After did / didn\'t, the form is use to.',
      examples: [
        'Morse used to be a professor at New York University.',
        'People would shout messages to the next tower.',
        "Did you use to have a blue car? — Yes, I did.",
      ],
    },
  ],
  questions: B.done(),
};
