import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-2');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'Hanan ___ a book for two hours. She ___ 30 pages.',
  o: ['has been reading / has read', 'has read / has been reading', 'reads / is reading', 'is reading / reads'],
  a: 0,
  d: 2,
  ex: 'The present perfect progressive shows how long the action has been going on. The present perfect simple gives the amount completed.',
  h: [
    'One half of the sentence says how long, the other says how much.',
    'Present perfect progressive = how long. Present perfect simple = how many / how much.',
    'Example: Saeed has been playing football since he was ten. He has played for three teams.',
  ],
});

B.mc({
  q: "I ___ for a job for three months, and I still ___ one.",
  o: ["'ve been looking / haven't found", "'ve looked / haven't been finding", 'looked / didn\'t find', 'look / don\'t find'],
  a: 0,
  d: 2,
  ex: 'The search is still going on, so it takes the present perfect progressive. Finding a job is a single completed result, so it takes the present perfect simple.',
  h: [
    'The searching continues, but finding either happens or it does not.',
    'Use the progressive for the continuing action and the simple for the result.',
    'Example: He has been writing books for years, but he hasn\'t received an award yet.',
  ],
});

B.mc({
  q: 'How many pages of that book ___?',
  o: ['have you read', 'have you been reading', 'do you read', 'are you reading'],
  a: 0,
  d: 2,
  ex: 'How many asks for a completed amount, and that is the job of the present perfect simple.',
  h: [
    '"How many" is asking you to count something finished.',
    'How long → progressive. How many → simple.',
    'Example: How many teams have you played for?',
  ],
});

B.blk({
  q: 'Salim has been working for the company ___ he left college.',
  a: ['since'],
  d: 1,
  ex: 'Since introduces the point in time when the action began; for introduces a length of time.',
  h: [
    'Is "he left college" a point in time, or a length of time?',
    'Use since with a starting point, and for with a period.',
    'Example: He has been a reporter for five years — since his internship.',
  ],
});

B.mc({
  q: "Matthew ___ as a food scientist for the last three years, and he ___ several new flavours.",
  o: ["has been working / has created", 'worked / created', 'is working / creates', 'has worked / has been creating'],
  a: 0,
  d: 3,
  ex: 'The job continues, so it takes the progressive. The flavours are finished results, so they take the simple.',
  h: [
    'One part of this sentence is still going on. The other part is a list of finished results.',
    'Continuing action → present perfect progressive. Finished results → present perfect simple.',
    'Example: She has been studying English for six years and has used four books.',
  ],
});

B.ord({
  q: 'Build the sentence about ability and interest.',
  c: ["He's good at", 'taking pictures,', "and he's interested in", 'becoming a photographer', '.'],
  d: 2,
  ex: 'After the prepositions at and in, the verb takes the -ing form.',
  h: [
    'Look at what comes straight after "good at" and "interested in".',
    'Adjective + preposition + gerund: good at + verb-ing, interested in + verb-ing.',
    'Example: They are interested in working outdoors.',
  ],
});

B.err({
  t: ['I', 'am', 'not', 'very', 'good', 'at', 'speak', 'in', 'public', '.'],
  a: 6,
  fix: 'speaking',
  d: 2,
  ex: 'A verb that follows a preposition must take the -ing form.',
  h: [
    'Find the preposition, then look at the very next word.',
    'Preposition + gerund: after at, in, of, for, the verb takes -ing.',
    "Example: She's not interested in working in the computer industry.",
  ],
});

B.mc({
  q: 'The new driver ___ started work yesterday is very quiet.',
  o: ['who', 'which', 'what', 'whose'],
  a: 0,
  d: 1,
  ex: 'Use who or that for people, and that or which for things and animals.',
  h: [
    'Is a driver a person or a thing?',
    'Relative pronouns: who / that for people, that / which for things.',
    'Example: I\'d like to introduce you to the person who organized the conference.',
  ],
});

B.mc({
  q: 'The computer company ___ is making a good profit is called Easy Surf.',
  o: ['which', 'who', 'whom', 'whose'],
  a: 0,
  d: 2,
  ex: 'The subject is a company, not a person, so which or that is used.',
  h: [
    'A company is a thing, not a person.',
    'Use that or which for things and animals.',
    'Example: The products that they launched this week are selling well.',
  ],
});

B.mc({
  q: 'Mohammed was working on the computer ___ his brother was talking on the phone.',
  o: ['while', 'when', 'because', 'so'],
  a: 0,
  d: 2,
  ex: 'While joins two actions that were happening at the same time, and both take the past progressive.',
  h: [
    'Were the two actions at the same time, or did one interrupt the other?',
    'Use while with the past progressive for two actions happening together.',
    'Example: While you were working at the studio, I was studying graphic design.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each job with what the person actually does.',
  pairs: [
    ['car sculptor', 'crafts clay models of cars'],
    ['food scientist', 'creates new flavours in a lab'],
    ['animation designer', 'brings characters to life on screen'],
    ['archaeological intern', 'digs slowly to uncover ruins'],
  ],
  d: 1,
  ex: 'All four jobs come from the Unit 2 texts about dream jobs and internships.',
  h: [
    'Match the easiest pair first, then the board gets smaller.',
    'Read the whole job description before you decide.',
    'Example: Salim spends his days using his hands to craft clay models.',
  ],
});

B.mem({
  q: 'Find the pairs: personal quality and what it looks like at work.',
  pairs: [
    ['reliable', 'always does what was promised'],
    ['efficient', 'finishes work without wasting time'],
    ['sociable', 'enjoys being with other people'],
    ['hardworking', 'puts a lot of effort into every task'],
  ],
  d: 2,
  ex: 'These personality characteristics are listed in the Unit 2 job profile section.',
  h: [
    'Turn one card, then hunt for the description that fits it.',
    'Each quality describes how a person behaves, not what they know.',
    'Example: creative = comes up with new ideas.',
  ],
});

B.mc({
  q: 'Clear and effective communication with team members and clients is ___ for animators.',
  o: ['crucial', 'miniature', 'permanent', 'stuck'],
  a: 0,
  d: 2,
  ex: 'Crucial means extremely important — the text says animation projects involve many people working as a team.',
  h: [
    'Which of these four words can describe how important something is?',
    'Crucial = extremely important.',
    'Example: Teamwork skills are crucial in this job.',
  ],
});

B.mc({
  q: 'Salim went to art school and was going to be an artist, but he ___ as a sculptor for General Motors.',
  o: ['ended up', 'gave up', 'put off', 'turned down'],
  a: 0,
  d: 2,
  ex: 'End up means to arrive at a situation you did not plan.',
  h: [
    'The sentence contrasts the original plan with what really happened.',
    'End up = finally be in a situation you did not plan.',
    'Example: I studied media, but I ended up working in radio.',
  ],
});

B.tf({
  q: '"Bored to death" means slightly bored.',
  a: false,
  d: 1,
  ex: 'Bored to death is a strong expression: it means very bored indeed.',
  h: [
    'Think about how strong the words "to death" sound.',
    'Bored to death = very bored.',
    'Example: It\'s the same thing day in and day out. I\'m bored to death.',
  ],
});

B.mc({
  q: 'Real Talk: "My parents talked me out of it" means they ___.',
  o: ['convinced me not to do it', 'helped me to do it', 'forgot about it', 'paid for it'],
  a: 0,
  d: 2,
  ex: 'To talk someone out of something is to convince them to do something different.',
  h: [
    'The word "out" is doing the work here.',
    'Talk someone out of it = convince them to do something different.',
    'Example: I wanted to be a watch repairer, but my parents talked me out of it.',
  ],
});

B.blk({
  q: 'A person who makes statues and models is a ___.',
  a: ['sculptor'],
  d: 1,
  ex: 'A sculptor works with clay, stone or metal. The thing they make is a sculpture.',
  h: [
    'The word for the object ends in -ure; the word for the person ends differently.',
    'Person words for jobs often end in -or or -er: sculptor, animator, reporter.',
    'Example: Some car companies have a permanent staff of sculptors.',
  ],
});

B.section('reading', '9 Reading', 'u2-p1');

B.mc({
  q: 'Which internship in the passage is unpaid?',
  o: ['the archaeological internship', 'the media internship', 'the engineering internship', 'all of them'],
  a: 0,
  d: 1,
  ex: 'The passage says the archaeological internship is unpaid, although lodging and meals are provided.',
  h: [
    'Scan each advert for words about money.',
    'Scanning means looking only for the detail you need.',
    'Example: search for "paid" and "unpaid".',
  ],
});

B.mc({
  q: 'What must the media intern be able to do?',
  o: [
    'find information quickly and summarize it clearly',
    'read blueprints',
    'work in very high temperatures',
    'dig slowly and carefully',
  ],
  a: 0,
  d: 2,
  ex: 'The media advert asks for interns who research hot topics, find information fast, and summarize it in clear language.',
  h: [
    'Go to the media advert only. Ignore the other two.',
    'Each advert lists its own required skills in one or two sentences.',
    'Example: "They need to find information quickly."',
  ],
});

B.tf({
  q: 'According to the passage, the engineering intern needs some knowledge of Arabic.',
  a: true,
  d: 1,
  ex: 'The engineering advert asks for a graduate who can read blueprints, has some Arabic, and can cope with high temperatures.',
  h: [
    'Look at the list of requirements in the engineering advert.',
    'True/false questions usually change one small detail — check every word.',
    'Example: compare "some knowledge of Arabic" with what the text really says.',
  ],
});

B.mc({
  q: 'What does Carl include under "Honors/Awards" in his résumé?',
  o: [
    'an award for the school website and a published article',
    'his computer skills',
    'his radio interviews',
    'his high school graduation',
  ],
  a: 0,
  d: 2,
  ex: 'The Honors/Awards section holds the school website award and the article that appeared in the local press.',
  h: [
    'A résumé is divided into headed sections. Find the right heading first.',
    'Reading a form or résumé means going to the section, not reading top to bottom.',
    'Example: Skills, Experience, Education and Honors are four different sections.',
  ],
});

B.mc({
  q: 'The passage says JobPool has been growing globally through ___.',
  o: ['strategic international expansion', 'television advertising', 'government funding', 'lower prices'],
  a: 0,
  d: 2,
  ex: 'The About Us paragraph explains the growth of the company through strategic international expansion.',
  h: [
    'The answer is in the short "About Us" paragraph at the top.',
    'A company profile usually says when it started and how it grew.',
    'Example: "Since its foundation in 2000..."',
  ],
});

B.mc({
  q: 'Which candidate is best suited to the media internship, based on the passage?',
  o: [
    'someone fluent in English, good with computers, friendly and outgoing',
    'someone who is patient and enjoys slow, careful physical work',
    'someone who can read technical drawings',
    'someone with a degree in medicine',
  ],
  a: 0,
  d: 3,
  ex: 'The media advert asks for fluent English, computer skills and a friendly, outgoing personality.',
  h: [
    'Match the qualities in each option against one advert only.',
    'To choose the best candidate, compare the person with the list of requirements.',
    'Example: an outgoing person greets guests easily.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'He works at the hospital ___ Sunday to Thursday.',
  o: ['from', 'in', 'at', 'on'],
  a: 0,
  d: 1,
  ex: 'From ... to marks the two ends of a period of time.',
  h: [
    'Look at the word "to" later in the sentence. What partners with it?',
    'From ... to shows the start and the end of a period.',
    'Example: The doctor is available from 5.00 to 6.00.',
  ],
});

B.mc({
  q: 'Adnan drives a city bus. He works ___ night.',
  o: ['at', 'in', 'on', 'from'],
  a: 0,
  d: 2,
  ex: 'Use at with night, noon and midnight; in with the morning/afternoon/evening; on with days.',
  h: [
    'Three little prepositions divide up the day between them.',
    'at night / in the morning / on Thursday.',
    'Example: In his free time, he plays football.',
  ],
});

B.mc({
  q: 'Hameed is a journalist. He writes for a newspaper. He works ___ weekdays and weekends.',
  o: ['on', 'at', 'in', 'to'],
  a: 0,
  d: 2,
  ex: 'On is used with days and parts of days: on Thursday, on weekdays, on Saturday morning.',
  h: [
    'Weekdays and weekends are made of days.',
    'Use on with days: on Thursday, on weekends, on Saturday morning.',
    'Example: He doesn\'t work on the weekend.',
  ],
});

B.mc({
  q: '"What do you do?" usually means ___.',
  o: ["What's your job?", 'What are you doing now?', 'Where do you live?', 'How are you?'],
  a: 0,
  d: 1,
  ex: 'In everyday English, What do you do? is a question about a person\'s job.',
  h: [
    'The simple present is used for permanent things, not for right now.',
    'What do you do? asks about your job. What are you doing? asks about now.',
    'Example: What do you do? — I\'m a salesperson.',
  ],
});

B.ord({
  q: 'Build the Wh- question about a workplace.',
  c: ['Where', 'do', 'Omar and Ali', 'work', '?'],
  d: 1,
  ex: 'A simple present Wh- question puts the question word first, then do/does, then the subject, then the base verb.',
  h: [
    'The main verb never changes its form in this kind of question.',
    'Wh- + do/does + subject + base verb.',
    'Example: Where does he work?',
  ],
});

B.err({
  t: ['It', 'was', 'raining', 'while', 'Yahya', 'washed', 'the', 'car', '.'],
  a: 5,
  fix: 'was washing',
  d: 3,
  ex: 'While joins two actions happening at the same time, so both verbs take the past progressive.',
  h: [
    'Look at the tense of the first verb, then check the second one matches.',
    'While + past progressive on both sides shows two actions at the same time.',
    'Example: It was raining while Yahya was washing the car.',
  ],
});

export const unit02: Unit = {
  id: 'unit-2',
  number: 2,
  title: 'Careers',
  pages: '20–33',
  functions: [
    'Talk about careers',
    'Talk about personal qualities and personality characteristics',
    "Talk about how long you've been doing something",
  ],
  grammar: [
    'Present perfect progressive and present perfect simple',
    'Adjective + preposition + gerund',
    'Simple present and Wh- questions',
    'Prepositions of time for the present',
    'Relative pronouns: who, that, which',
    'Past progressive with while',
  ],
  passages: [
    {
      id: 'u2-p1',
      unitId: 'unit-2',
      title: 'JobPool Has the Job for You',
      source: 'Written for Torches, based on the Unit 2 reading about internships and résumés (Student Book pages 26–27).',
      paragraphs: [
        'About us: JobPool is a privately-owned career network with branches all over the world. Since its foundation in 2000, the company has constantly improved the experience of its users with new features and services, and it has been growing globally through strategic international expansion.',
        'Media Intern — TV and Radio Media International. Our interns research information about hot topics. They need to find information quickly and be able to summarize it in clear language, because our hosts use that information on their programmes. Interns also greet our guests when they arrive at the studios. You need to be fluent in English and good at using computers, and you must be friendly and outgoing. This is a paid internship for the summer.',
        'Archaeological Interns — Students Learning Overseas. Here is an opportunity to study history at first hand and to work with noted archaeologists on an exciting dig. The job of the interns is to dig slowly and carefully, and to uncover buildings that have been buried for centuries. It is hard, painstaking work. This is an unpaid three-month internship, but lodging and meals are provided near the site.',
        'Environmental Engineering — Saudi Construction, Riyadh. A great opportunity for a civil engineering graduate student in the environment field. The project involves the construction of a road and a number of local projects such as research centres and pipelines. You need to be able to read blueprints, have some knowledge of Arabic, and be able to cope with temperatures that average 40°C. Food and accommodation will be provided.',
        'Applicants should attach a cover letter and a résumé. A good résumé is organized under clear headings. Carl, for example, lists his education, then his experience as the host of a radio programme and the student in charge of the school website. Under Honors and Awards he notes that the school website won a state award and that an article he wrote about jobs for young people appeared in the local press. Under Skills he lists computer expertise in word-processing and graphic programs, and fluency in Spanish.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Present perfect: progressive or simple?',
      rule: 'Use the present perfect progressive for an action that is still happening and will probably continue. Use the present perfect simple for how many times or how much has been done up to now.',
      examples: [
        'Hanan has been reading a book for two hours. She has read 30 pages.',
        'Saeed has been playing football since he was ten. He has played for three different teams.',
      ],
    },
    {
      skill: 'grammar',
      title: 'Adjective + preposition + gerund',
      rule: 'After a preposition, a verb takes the -ing form. Use good at and interested in to talk about abilities and interests.',
      examples: [
        "He's good at using computers.",
        "They're interested in working outdoors.",
      ],
    },
    {
      skill: 'form',
      title: 'Relative pronouns and while',
      rule: 'Use who or that for people, and that or which for things and animals. Use while with the past progressive for two actions happening at the same time.',
      examples: [
        'The woman who was talking to the clients was friendly.',
        'The computer company that is making a good profit is called Easy Surf.',
        'While she was talking downstairs, her mother was looking for her upstairs.',
      ],
    },
  ],
  questions: B.done(),
};
