import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-12');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'Report it: "I have a brother and a sister."',
  o: [
    'He said he had a brother and a sister.',
    'He said he has a brother and a sister.',
    'He said he had had a brother and a sister.',
    'He said he have a brother and a sister.',
  ],
  a: 0,
  d: 1,
  ex: 'In reported speech the simple present moves back one step to the simple past.',
  h: [
    'Every tense takes one step back into the past.',
    'Simple present → simple past in reported speech.',
    "Example: \"I don't like mangoes.\" → She said she didn't like mangoes.",
  ],
});

B.mc({
  q: 'Report it: "I\'m talking to Mary."',
  o: [
    'She said she was talking to Mary.',
    'She said she is talking to Mary.',
    'She said she had talked to Mary.',
    'She said she talks to Mary.',
  ],
  a: 0,
  d: 1,
  ex: 'The present progressive becomes the past progressive.',
  h: [
    'Keep the -ing, but change the auxiliary.',
    'Present progressive → past progressive.',
    'Example: "The plane is arriving now." → Mary said the plane was arriving then.',
  ],
});

B.mc({
  q: 'Report it: "I learned English in Canada."',
  o: [
    'He said he had learned English in Canada.',
    'He said he learned English in Canada.',
    'He said he has learned English in Canada.',
    'He said he learns English in Canada.',
  ],
  a: 0,
  d: 2,
  ex: 'The simple past moves back to the past perfect.',
  h: [
    'The original sentence is already in the past — so what comes before the past?',
    'Simple past → past perfect.',
    'Example: "I haven\'t seen the film yet." → She said she hadn\'t seen the film yet.',
  ],
});

B.mc({
  q: 'Report it: "I\'ll see you later."',
  o: [
    'She said she would see them later.',
    'She said she will see them later.',
    'She said she saw them later.',
    'She said she had seen them later.',
  ],
  a: 0,
  d: 2,
  ex: 'Will becomes would in reported speech.',
  h: [
    'Modal verbs also step back one place.',
    'will → would; can → could; may → might; must / have to → had to.',
    'Example: "I can\'t come to the meeting." → He said he couldn\'t come.',
  ],
});

B.mc({
  q: 'Report the question: "How old are you?"',
  o: [
    'He asked how old I was.',
    'He asked how old was I.',
    'He asked how old am I.',
    'He asked how old I am.',
  ],
  a: 0,
  d: 2,
  ex: 'A reported question keeps the statement word order — subject before verb — and steps the tense back.',
  h: [
    'A reported question does not sound like a question any more.',
    'Reported question: question word + subject + verb (no inversion).',
    'Example: She wanted to know where we had been the night before.',
  ],
});

B.mc({
  q: 'Report the question: "Are you a student?"',
  o: [
    'He asked if Tom was a student.',
    'He asked was Tom a student.',
    'He asked that Tom was a student.',
    'He asked Tom is a student.',
  ],
  a: 0,
  d: 2,
  ex: 'When there is no question word, if is used to introduce the reported question.',
  h: [
    'There is no how, where or when in the original question.',
    'No question word → use if.',
    'Example: She asked if they had enjoyed the dinner party.',
  ],
});

B.mc({
  q: 'Report it: "The plane is arriving now."',
  o: [
    'Mary said the plane was arriving at that time.',
    'Mary said the plane was arriving now.',
    'Mary said the plane is arriving then.',
    'Mary said the plane arrives now.',
  ],
  a: 0,
  d: 3,
  ex: 'Time words change too: now becomes at that time or then.',
  h: [
    'Two things change here: the tense and one time word.',
    'now → at that time; today → that day; tomorrow → the next day; yesterday → the day before.',
    'Example: "I did my homework already." → Todd said he had done his homework already.',
  ],
});

B.mc({
  q: 'Choose the correct reporting verb: "Yes, it\'s a good idea." My friend ___ it was a good idea.',
  o: ['agreed', 'assured', 'refused', 'complained'],
  a: 0,
  d: 2,
  ex: 'A variety of verbs can replace say, and each carries its own shade of meaning.',
  h: [
    'What is the speaker actually doing with these words?',
    'Reporting verbs: agree, assure, insist, complain, refuse, promise.',
    'Example: Tom assured the teacher that he had done his homework.',
  ],
});

B.mc({
  q: 'Which sentence is correct?',
  o: [
    'He told me that he had studied English in the States.',
    'He told that he had studied English in the States.',
    'He said me that he had studied English.',
    'He told to me that he had studied English.',
  ],
  a: 0,
  d: 3,
  ex: 'Tell always needs an indirect object (tell me, tell him); say does not take one directly.',
  h: [
    'One of these two verbs always needs a person after it.',
    'tell + somebody + that ...; say + that ... (no person directly after say).',
    'Example: He said he had learned English in Canada.',
  ],
});

B.ord({
  q: 'Build the reported statement.',
  c: ['The candidate', 'said', 'he would build', 'a sports complex', '.'],
  d: 2,
  ex: 'The reporting verb comes first, then the reported clause with the tense stepped back.',
  h: [
    'Which part tells you who is speaking?',
    'reporter + said + (that) + reported clause.',
    'Example: The doctor said that pomegranate juice was healthy.',
  ],
});

B.err({
  t: ['She', 'asked', 'where', 'was', 'the', 'nearest', 'bank', '.'],
  a: 3,
  fix: '(move it: ... where the nearest bank was)',
  d: 3,
  ex: 'In a reported or indirect question there is no inversion — the subject comes before the verb.',
  h: [
    'Read it aloud. It still sounds like a direct question.',
    'Reported/indirect questions keep statement word order.',
    'Example: Do you know where the nearest bank is?',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each Unit 12 word with its meaning.',
  pairs: [
    ['proof', 'evidence that something is true'],
    ['candidate', 'a person trying to be elected'],
    ['scan', 'get an image with a machine'],
    ['bother', 'make the effort to do something'],
    ['nuisance', 'a person or thing that annoys you'],
  ],
  d: 2,
  ex: 'These words come from the Unit 12 news reports and the telemarketing conversation.',
  h: [
    'Clear the pair you are sure of first.',
    'Read each word inside a sentence from the unit before choosing.',
    'Example: Telemarketers are a real nuisance.',
  ],
});

B.mem({
  q: 'Find the pairs: environment word and its meaning.',
  pairs: [
    ['deforestation', 'cutting down large areas of forest'],
    ['erosion', 'the slow wearing away of land'],
    ['tsunami', 'a huge sea wave after an earthquake'],
    ['drought', 'a long period with no rain'],
  ],
  d: 2,
  ex: 'These belong to the Unit 12 vocabulary about the environment and natural disasters.',
  h: [
    'Turn one card and keep its word in your head while you search.',
    'Two of these are human actions and two are natural events.',
    'Example: global warming, flood, earthquake, tornado, volcanic eruption.',
  ],
});

B.mc({
  q: 'Choose the word that means "to make something better".',
  o: ['improve', 'deteriorate', 'interrupt', 'persuade'],
  a: 0,
  d: 1,
  ex: 'Improve and deteriorate are opposites in the Unit 12 vocabulary list.',
  h: [
    'One of these four words is the exact opposite of the answer.',
    'improve = get better; deteriorate = get worse.',
    'Example: Pumpkin seeds seem to improve memory.',
  ],
});

B.mc({
  q: 'A ___ person keeps trying to make you do something you do not want to do.',
  o: ['pushy', 'annoyed', 'powerful', 'healthy'],
  a: 0,
  d: 2,
  ex: 'Faisal describes the telemarketer as very pushy because he kept insisting.',
  h: [
    'The word comes from the verb "push".',
    'pushy = too forceful in trying to get what you want.',
    'Example: But he insisted and was very pushy.',
  ],
});

B.tf({
  q: 'Real Talk: a "hoax" is a plan designed to trick someone.',
  a: true,
  d: 1,
  ex: 'Khaled calls the free trip to the Bahamas a big hoax, because he would have had to pay first.',
  h: [
    'Think about the free trip that turned out not to be free.',
    'hoax = a plan designed to trick someone.',
    'Example: It turned out that everything was for free — big hoax!',
  ],
});

B.blk({
  q: 'Complete the expression: "In the ___, I lost my patience and hung up." (finally)',
  a: ['end'],
  d: 1,
  ex: 'In the end introduces the final event or result.',
  h: [
    'The expression has three words and appears in the Real Talk box.',
    'in the end = used to introduce the final event or result.',
    'Example: In the end, I lost my patience and hung up.',
  ],
});

B.section('reading', '9 Reading', 'u12-p1');

B.mc({
  q: 'According to the passage, what did Benjamin Franklin say about the rich person?',
  o: [
    'The rich person is the one who is content.',
    'The rich person is the one who learns from everyone.',
    'The rich person is the one who governs a nation.',
    'The rich person is nobody.',
  ],
  a: 0,
  d: 2,
  ex: 'Franklin defines the wise, the powerful and the rich in turn, and links being rich to being content.',
  h: [
    'The quotation asks three questions and answers each one.',
    'When a quotation has a pattern, follow the pattern to the part you need.',
    'Example: Who is wise? He that learns from everyone.',
  ],
});

B.mc({
  q: 'What does the passage say Mark Twain advised about education?',
  o: [
    'Never let formal education get in the way of your learning.',
    'Formal education is the only way to learn.',
    'Learning stops after school.',
    'Education should be free.',
  ],
  a: 0,
  d: 1,
  ex: 'The passage attributes exactly this idea to Mark Twain.',
  h: [
    'Scan for the name Mark Twain.',
    'When a text lists people and their words, names are the fastest route.',
    'Example: Wise men talk because they have something to say.',
  ],
});

B.tf({
  q: 'According to the passage, Helen Keller was the first deaf and blind person to graduate from college.',
  a: true,
  d: 1,
  ex: 'The passage gives this fact in the note that introduces her.',
  h: [
    'The information about each speaker is in the short note beside the quotation.',
    'Notes and captions hold background facts.',
    'Example: She was an American author, activist and lecturer.',
  ],
});

B.mc({
  q: 'According to the passage, what did Plato say about fools?',
  o: [
    'They talk because they have to say something.',
    'They never talk at all.',
    'They talk because they have something to say.',
    'They talk only to wise men.',
  ],
  a: 0,
  d: 2,
  ex: 'Plato contrasts wise men, who talk because they have something to say, with fools, who talk because they have to say something.',
  h: [
    'The quotation has two halves. Read the second one carefully.',
    'A contrast quotation is easy to reverse by mistake — check the order.',
    'Example: Wise men talk because they have something to say.',
  ],
});

B.mc({
  q: 'What idea does the passage attribute to Ralph Waldo Emerson?',
  o: [
    'Make yourself necessary to somebody.',
    'Never complain.',
    'Learn from everyone.',
    'Education is a waste of time.',
  ],
  a: 0,
  d: 2,
  ex: 'That short line is the quotation given for Emerson in the reading.',
  h: [
    'Scan for the name, then read only that quotation.',
    'Do not read all the quotations — go straight to the name.',
    'Example: Those who do not complain are never pitied. — Jane Austen',
  ],
});

B.mc({
  q: 'What was wrong with the 1899 prediction quoted in the passage?',
  o: [
    'Inventions have continued ever since.',
    'It was made by a scientist.',
    'It was about the environment.',
    'It was never written down.',
  ],
  a: 0,
  d: 2,
  ex: 'The claim that everything that can be invented has been invented was clearly proved wrong by the century that followed.',
  h: [
    'Think about everything invented after 1899.',
    'A prediction can be tested against what actually happened.',
    'Example: The quotation is attributed to a commissioner of patents in 1899.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Make it an indirect question: "Where is the nearest pharmacy?"',
  o: [
    'Do you know where the nearest pharmacy is?',
    'Do you know where is the nearest pharmacy?',
    'Do you know where the nearest pharmacy?',
    'Do you know is the nearest pharmacy where?',
  ],
  a: 0,
  d: 2,
  ex: 'An indirect question has no inversion of the subject and the verb.',
  h: [
    'The verb must come after the subject, not before it.',
    'Do you know / Could you tell me + question word + subject + verb.',
    'Example: Do you know when the store opens?',
  ],
});

B.mc({
  q: 'A: I ate at the new pizza restaurant. B: ___',
  o: ['So did I.', 'Neither did I.', 'So I did too.', 'I did neither.'],
  a: 0,
  d: 1,
  ex: 'So + auxiliary + subject agrees with an affirmative statement; "I did too" is the other correct form.',
  h: [
    'The statement is positive.',
    'Affirmative: So did I. / I did too. Negative: Neither do I. / I don\'t either.',
    "Example: I won't go to school tomorrow. — Neither will I.",
  ],
});

B.mc({
  q: "A: I don't know the answer. B: ___",
  o: ["Neither do I.", 'So do I.', 'I do too.', 'So I do.'],
  a: 0,
  d: 2,
  ex: 'Neither + auxiliary + subject agrees with a negative statement, and "I don\'t either" means the same.',
  h: [
    'The first statement contains a negative.',
    'Negative agreement: Neither do I. / I don\'t either.',
    "Example: I won't be able to go on vacation. — Neither will I.",
  ],
});

B.mc({
  q: 'A: I like fast food. B: (disagreeing) ___',
  o: ["I don't.", 'Neither do I.', 'So do I.', 'I do too.'],
  a: 0,
  d: 2,
  ex: 'To disagree, use the auxiliary in the opposite form, with no so or neither.',
  h: [
    'Disagreement is short — just a subject and an auxiliary.',
    "Disagree: A: I didn't like the pizza. B: I did.",
    "Example: A: I am not very tall. B: I am.",
  ],
});

B.mc({
  q: 'Choose the correct negative question for this situation: your brother is still in bed at 8:30 and classes start at eight.',
  o: [
    "Aren't you going to school today?",
    'Are you going to school today?',
    'You go to school today?',
    'Do you going to school?',
  ],
  a: 0,
  d: 2,
  ex: 'A negative question expresses surprise or checks information.',
  h: [
    'The speaker is surprised, not just asking for information.',
    'Negative questions check information or express surprise.',
    "Example: Haven't you seen the news?",
  ],
});

B.blk({
  q: 'Complete with the relative adverb: That is the school ___ I studied as a child.',
  a: ['where'],
  d: 2,
  ex: 'Where is the relative adverb used for a place.',
  h: [
    'The word connects the sentence to a place.',
    'Relative adverb where = in that place.',
    'Example: Dubai is the place where I want to go on vacation.',
  ],
});

export const unit12: Unit = {
  id: 'unit-12',
  number: 12,
  title: 'What They Said',
  pages: '182–195',
  functions: [
    'Report what people said',
    'Discuss famous quotes and relate messages',
    'Discuss the environment and natural disasters',
  ],
  grammar: [
    'Reported speech',
    'Reported questions',
    'Word changes in reported speech',
    'Reporting verbs',
    'Negative questions; indirect questions',
    'Relative adverb: where; agreement with so, neither, either, too',
  ],
  passages: [
    {
      id: 'u12-p1',
      unitId: 'unit-12',
      title: 'Quotes, Quotes',
      source: 'Written for Torches, based on the Unit 12 reading (Student Book pages 188–189). The quotations are short lines by writers of the past.',
      paragraphs: [
        'A quotation is a short group of words taken from a speech or a piece of writing. Good quotations last because they say something in very few words, and because a reader can argue with them.',
        'Benjamin Franklin, the American writer, diplomat, scientist and inventor, asked three questions and answered them himself: who is wise? He that learns from everyone. Who is powerful? He that governs his passions. Who is rich? He that is content.',
        'The Greek philosopher Plato drew a sharp line between two kinds of speaker. Wise men, he said, talk because they have something to say; fools talk because they have to say something.',
        'The writer Mark Twain gave a warning about school: never let formal education get in the way of your learning. In other words, learning does not stop at the classroom door, and it does not stop when the course ends.',
        'Helen Keller, an American author, activist and lecturer, was the first deaf and blind person to graduate from college. Her most famous line reminds us that having sight is not the same as having vision: it is a terrible thing, she said, to see and have no vision.',
        'Not every famous line has aged well. In 1899 a commissioner of the United States Office of Patents is supposed to have declared that everything that can be invented has been invented. The century that followed answered him. Ralph Waldo Emerson gave shorter and better advice: make yourself necessary to somebody.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Reported speech',
      rule: 'When you report what somebody said, the tense steps back one place: present → past, past → past perfect, will → would, can → could, may → might, must → had to.',
      examples: [
        '"I have a brother." → He said he had a brother.',
        '"I learned English in Canada." → He said he had learned English in Canada.',
        '"I\'ll see you later." → She said she would see them later.',
      ],
    },
    {
      skill: 'grammar',
      title: 'Reported and indirect questions',
      rule: 'A reported question keeps statement word order — no inversion. If there is no question word, use if.',
      examples: [
        'How old are you? → He asked how old I was.',
        'Are you a student? → He asked if Tom was a student.',
        'Where is the nearest bank? → Do you know where the nearest bank is?',
      ],
    },
    {
      skill: 'form',
      title: 'Agreeing and disagreeing',
      rule: 'Use so and too to agree with an affirmative statement, and neither and either to agree with a negative one. To disagree, simply use the auxiliary in the opposite form.',
      examples: [
        'I ate at the new pizza restaurant. — So did I. / I did too.',
        "I don't know the answer. — Neither do I. / I don't either.",
        "I didn't like the pizza. — I did.",
      ],
    },
  ],
  questions: B.done(),
};
