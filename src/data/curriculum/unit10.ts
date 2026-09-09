import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-10');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'When we arrived at the airport, our flight ___.',
  o: ['had already left', 'already left', 'has already left', 'was already leaving'],
  a: 0,
  d: 1,
  ex: 'The past perfect shows the action that happened first, before another past action.',
  h: [
    'Two things happened. Which one happened first?',
    'Past perfect (had + past participle) marks the earlier of two past actions.',
    'Example: They couldn\'t get in because they had forgotten the key.',
  ],
});

B.mc({
  q: 'I never travelled outside my country until I ___ to Disney World last summer.',
  o: ['went', 'had gone', 'have gone', 'was going'],
  a: 0,
  d: 2,
  ex: 'The trip is the later event with a stated time, so it takes the simple past; the earlier situation takes the past perfect.',
  h: [
    'The words "last summer" belong to only one of the two verbs.',
    'The later action takes the simple past; the earlier one takes the past perfect.',
    'Example: I had never travelled outside my country until I went to Disney World.',
  ],
});

B.mc({
  q: 'You haven\'t eaten all day. You ___ be starving.',
  o: ['must', "can't", 'might not', "couldn't"],
  a: 0,
  d: 1,
  ex: 'Must expresses a conclusion the speaker is sure about.',
  h: [
    'How certain is the speaker after "you haven\'t eaten all day"?',
    'must = sure; may/might/could = possible; can\'t/couldn\'t = impossible.',
    'Example: It must be a helicopter.',
  ],
});

B.mc({
  q: 'Pat is joking. She ___ be serious.',
  o: ["can't", 'must', 'might', 'could'],
  a: 0,
  d: 2,
  ex: "Can't expresses that the speaker thinks something is impossible.",
  h: [
    'If she is joking, how possible is it that she is serious?',
    "can't / couldn't = the speaker thinks it is impossible.",
    "Example: It can't be a balloon. Balloons aren't shaped like that.",
  ],
});

B.mc({
  q: 'It ___ a glider, but gliders don\'t fly vertically.',
  o: ['might be', 'must be', "can't be", 'is'],
  a: 0,
  d: 2,
  ex: 'Might, may and could express possibility rather than certainty.',
  h: [
    'The second half of the sentence raises a doubt, so the first half cannot be certain.',
    'may / might / could = something is possible.',
    'Example: It might be a new design of sunglasses.',
  ],
});

B.mc({
  q: 'Speculating about the past: "The driver ___ control of the truck."',
  o: ['must have lost', 'must lose', 'must be losing', 'must lost'],
  a: 0,
  d: 2,
  ex: 'To speculate about the past, use the modal + have + past participle.',
  h: [
    'The event is finished, so the form after the modal has to change.',
    'must / might / could / can\'t + have + past participle.',
    'Example: It must have been a helicopter.',
  ],
});

B.mc({
  q: 'Neighbours said they had heard a terrific noise, ___ nobody reported it to the police.',
  o: ['yet', 'because', 'so', 'while'],
  a: 0,
  d: 2,
  ex: 'Yet joins two independent clauses and shows a surprising contrast.',
  h: [
    'Is the second half of this sentence expected or surprising?',
    'and, but, or, so and yet join two independent clauses; yet and but mark contrast.',
    'Example: The house was destroyed, so they moved.',
  ],
});

B.mc({
  q: 'Choose the correct punctuation.',
  o: [
    'When they arrived home, they discovered a meteorite had crashed through the roof.',
    'When they arrived home they discovered, a meteorite had crashed through the roof.',
    'When, they arrived home they discovered a meteorite had crashed through the roof.',
    'When they arrived home they discovered a meteorite, had crashed through the roof.',
  ],
  a: 0,
  d: 2,
  ex: 'When the time clause comes before the main clause, a comma separates the two.',
  h: [
    'The comma marks the end of the time clause.',
    'Time clause first → comma between the two clauses.',
    'Example: As soon as the dinner is over, I will call you.',
  ],
});

B.mc({
  q: 'When you heat water to 100 degrees Celsius, it ___.',
  o: ['boils', 'will boil', 'boiled', 'is boiling'],
  a: 0,
  d: 1,
  ex: 'A present fact conditional uses the simple present in both clauses.',
  h: [
    'Is this always true, or only in the future?',
    'Present facts: simple present in both clauses.',
    'Example: When you mix flour and water, you end up with batter.',
  ],
});

B.mc({
  q: "If you don't leave now, you ___ late.",
  o: ['will be', 'are', 'were', 'would be'],
  a: 0,
  d: 1,
  ex: 'A future fact conditional uses the simple present in the if-clause and will in the result clause.',
  h: [
    'The if-clause is already in the present, so the result must point forward.',
    'Future facts: if + simple present, ... will + base verb.',
    'Example: If we get this HD television, we will see the game better.',
  ],
});

B.ord({
  q: 'Build the past perfect question.',
  c: ['Had', 'she', 'been', 'there', 'before', '?'],
  d: 1,
  ex: 'A past perfect question puts had before the subject, then the past participle.',
  h: [
    'One word has to jump to the front to make it a question.',
    'Had + subject + past participle?',
    'Example: Had he been there before? — Yes, he had.',
  ],
});

B.err({
  t: ['Dinosaurs', 'were', 'extinct', 'for', 'millions', 'of', 'years', 'before', 'the', 'first', 'humans', 'appeared', '.'],
  a: 1,
  fix: 'had been',
  d: 3,
  ex: 'The dinosaurs disappeared before humans appeared, so the earlier fact takes the past perfect.',
  h: [
    'The word "before" tells you which event came first.',
    'The earlier of two past events takes the past perfect.',
    'Example: Dinosaurs had been extinct for millions of years before the first humans appeared.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each Unit 10 word with its meaning.',
  pairs: [
    ['meteorite', 'a rock from space that reaches the ground'],
    ['crater', 'a large hole made by an impact'],
    ['debris', 'broken pieces left after damage'],
    ['fragment', 'a small piece broken off something'],
    ['weird', 'strange and hard to explain'],
  ],
  d: 2,
  ex: 'These words come from the Unit 10 news report about the meteorite and the park conversation.',
  h: [
    'Two of these words mean broken pieces — read both carefully.',
    'debris = broken material in general; fragment = one separate piece.',
    'Example: ...leaving debris and fragments along its path.',
  ],
});

B.mem({
  q: 'Find the pairs: Vision word and its meaning.',
  pairs: [
    ['asset', 'a useful or valuable quality or person'],
    ['sustainable', 'lasting, not destroying natural resources'],
    ['urban', 'of cities and towns'],
    ['remote', 'far away'],
  ],
  d: 2,
  ex: 'These words appear in the Unit 10 reading about the Kingdom in 2030.',
  h: [
    'Turn one card and hold the word in mind while you search.',
    'Two of these are about places, and two are about value.',
    'Example: ...citizens who live in remote areas.',
  ],
});

B.mc({
  q: 'Choose the meaning of "streamlined" as it is used in Unit 10.',
  o: ['made simpler and more effective', 'made larger', 'made more expensive', 'made secret'],
  a: 0,
  d: 2,
  ex: 'Government services will be streamlined to support new enterprises — that is, made simpler and more productive.',
  h: [
    'The sentence in the unit says why the services are changed.',
    'streamlined = made simpler, more effective and productive.',
    'Example: The renewed and streamlined business environment will increase opportunities.',
  ],
});

B.mc({
  q: 'An ___ is a business organization.',
  o: ['enterprise', 'asset', 'orbit', 'device'],
  a: 0,
  d: 1,
  ex: 'Enterprise means a business or a company, especially a new one.',
  h: [
    'Three of these are not about business at all.',
    'enterprise = a business organization.',
    'Example: Government services will support the operation of new enterprises.',
  ],
});

B.tf({
  q: 'Real Talk: "Beats me!" means "I have no idea."',
  a: true,
  d: 1,
  ex: 'Greg says it in the park conversation when he cannot explain the strange object.',
  h: [
    'Think of the moment when Samir asks what the object is.',
    'Beats me! = I have no idea.',
    'Example: Beats me! It must have fallen from the sky.',
  ],
});

B.blk({
  q: 'A large hole left in the ground by an impact is a ___.',
  a: ['crater'],
  d: 1,
  ex: 'The word is used both for volcanoes and for the mark left by a meteorite.',
  h: [
    'The word also appears in the Unit 10 pronunciation list of -er words.',
    'crater = a large hole made by an explosion or an impact.',
    'Example: It must be the crater of a volcano.',
  ],
});

B.section('reading', '9 Reading', 'u10-p1');

B.mc({
  q: 'According to the passage, what is the most valuable asset of the Kingdom?',
  o: [
    'its Islamic, family-oriented society',
    'its oil reserves',
    'its geographical position',
    'its libraries and museums',
  ],
  a: 0,
  d: 1,
  ex: 'The first paragraph contrasts natural resources with the society, and calls the society the most valuable asset.',
  h: [
    'The word "however" in the first paragraph signals the important idea.',
    '"However" usually introduces the writer\'s main point.',
    'Example: ...the most valuable asset is its Islamic, family-oriented society.',
  ],
});

B.mc({
  q: 'What does the passage say higher education will do?',
  o: [
    'address real needs and provide training for employment',
    'become free for every citizen',
    'move to remote areas',
    'focus only on science',
  ],
  a: 0,
  d: 2,
  ex: 'The text says higher education will address real needs and provide the knowledge and training people need for employment and professional development.',
  h: [
    'Scan for the phrase "higher education".',
    'Scanning for a two-word phrase is faster than reading the paragraph.',
    'Example: Libraries, galleries and museums will be established in different areas.',
  ],
});

B.tf({
  q: 'According to the passage, the geographical position of the Kingdom will help make it an international trade and transportation centre.',
  a: true,
  d: 1,
  ex: 'The passage says the position connects Europe, Africa and Asia.',
  h: [
    'Look in the section about the economy.',
    'Headings divide a text — use them to find the right section.',
    'Example: ...connects Europe, Africa and Asia.',
  ],
});

B.mc({
  q: 'Why will telecommunications be made available in rural areas, according to the passage?',
  o: [
    'to give people in remote areas access to information and jobs',
    'to reduce the cost of building roads',
    'to attract tourists',
    'to replace libraries',
  ],
  a: 0,
  d: 2,
  ex: 'The passage links updated telecommunications directly to additional access to information and employment opportunities for citizens in remote areas.',
  h: [
    'Find the sentence about rural areas and read what comes after it.',
    'A purpose is often given in the sentence following the plan.',
    'Example: Telecommunications and information technology will be updated.',
  ],
});

B.mc({
  q: 'What does the passage say about culture and entertainment projects?',
  o: [
    'They will contribute to the quality of life and celebrate national identity.',
    'They will replace sports.',
    'They will be built only in the capital.',
    'They will be paid for by visitors.',
  ],
  a: 0,
  d: 2,
  ex: 'The passage says these projects will contribute to quality of life and celebrate the faith, national identity, culture and heritage of the nation.',
  h: [
    'Scan for the word "culture".',
    'A list of nouns after a verb often holds the answer.',
    'Example: Libraries, galleries and museums will be established.',
  ],
});

B.mc({
  q: 'How does the passage describe the business environment of the future?',
  o: ['dynamic, with upgraded services and facilities', 'small and local', 'closed to foreign investors', 'unchanged'],
  a: 0,
  d: 2,
  ex: 'The text says a dynamic business environment with upgraded services will offer opportunities for investment and attract businesses from different countries.',
  h: [
    'Look for an adjective just before the words "business environment".',
    'Adjectives carry the writer\'s description — find them first.',
    'Example: ...attract large and small businesses from different countries.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'Choose the correct intensifier: "The crowd was ___ terrified."',
  o: ['absolutely', 'very', 'a little', 'quite a'],
  a: 0,
  d: 3,
  ex: 'Terrified is a non-gradable adjective, so it takes absolutely, really or quite — not very.',
  h: [
    'Is "terrified" a little frightened, or completely frightened?',
    'Gradable adjectives take very; non-gradable ones take absolutely.',
    'Example: absolutely amazing, absolutely massive.',
  ],
});

B.mc({
  q: 'Which sentence uses a gradable adjective correctly?',
  o: [
    'The object was very small.',
    'The object was very tiny.',
    'The object was very massive.',
    'The object was very terrifying.',
  ],
  a: 0,
  d: 3,
  ex: 'Small is gradable, so it takes very. Tiny, massive and terrifying are non-gradable and take absolutely or really.',
  h: [
    'Three of these adjectives already mean "completely".',
    'Non-gradable adjectives: tiny, massive, terrifying, amazing, fascinating.',
    'Example: The object was absolutely tiny.',
  ],
});

B.mc({
  q: 'If you think you have found a meteorite, you ___ photograph it.',
  o: ['must', 'need not', "don't have to", 'might not'],
  a: 0,
  d: 2,
  ex: 'Must and have to express necessity; needn\'t and don\'t need to express lack of necessity.',
  h: [
    'Is the instruction telling you to do it, or telling you it is optional?',
    'must / have to = necessity. don\'t need to / needn\'t = lack of necessity.',
    'Example: You don\'t need to worry.',
  ],
});

B.mc({
  q: 'Strange things fall from the sky all the time, so you ___ panic.',
  o: ["don't need to", 'must', 'have to', 'should'],
  a: 0,
  d: 2,
  ex: 'Don\'t need to expresses lack of necessity — nothing forces you to do it.',
  h: [
    'The first half of the sentence removes the reason to worry.',
    "don't need to / needn't = it is not necessary.",
    'Example: You don\'t need to (needn\'t) worry.',
  ],
});

B.ord({
  q: 'Build the sentence with a time clause first.',
  c: ['Before', 'I saw the crash,', 'I', 'had heard', 'a humming sound', '.'],
  d: 3,
  ex: 'The time clause with before comes first and is followed by a comma; the earlier action takes the past perfect.',
  h: [
    'The word "before" always opens the time clause.',
    'Time clause + comma + main clause. The earlier action takes the past perfect.',
    'Example: When they arrived home, they discovered the roof had been smashed.',
  ],
});

B.blk({
  q: 'If they climb up to 4,000 metres, they ___ need oxygen. (a likely future result)',
  a: ['will', "'ll"],
  d: 2,
  ex: 'A future fact conditional uses simple present in the if-clause and will in the result clause.',
  h: [
    'The if-clause is in the present, so the result points forward.',
    'if + simple present, ... will + base verb.',
    'Example: If you see a falling star, it may be a meteorite.',
  ],
});

export const unit10: Unit = {
  id: 'unit-10',
  number: 10,
  title: 'I Wonder What Happened',
  pages: '154–167',
  functions: [
    'Talk about events that happened in the past before others',
    'Speculate about facts and events',
    'Express enthusiasm; express necessity and lack of necessity',
  ],
  grammar: [
    'Past perfect tense',
    "Can't, could, couldn't, must, may, might for speculation",
    'Independent clauses with and, but, or, so, yet',
    'The past with dependent time clauses',
    'Conditional sentences with present and future forms',
    'Intensifiers with gradable and non-gradable adjectives',
  ],
  passages: [
    {
      id: 'u10-p1',
      unitId: 'unit-10',
      title: 'The Kingdom in 2030',
      source: 'Written for Torches, based on the Unit 10 reading about Vision 2030 (Student Book pages 160–161).',
      paragraphs: [
        'The Kingdom of Saudi Arabia is blessed with a great amount of natural resources and with amazing opportunities for economic growth. However, its most valuable asset is its Islamic, family-oriented society.',
        'The people. The 2030 Vision will provide the support and the opportunities that this society needs in order to develop its potential. Members of the society will enjoy a secure and happy life in a sustainable environment. They will have social support, health care and high quality education, and they will be able to raise their children according to Islamic values and help develop their talents and abilities.',
        'Culture and entertainment projects will contribute to the quality of life and celebrate the faith, the national identity, the culture and the heritage of the nation. Libraries, galleries and museums will be established in different areas. Higher education will address real needs and provide the knowledge and training that people need for employment and professional development.',
        'The Kingdom is honoured to welcome and serve an increasing number of pilgrims and visitors from across the globe every year. The expansion of the Two Holy Mosques and the upgrading of services and facilities had already helped to cater for fifteen million visitors by 2020, and these improvements will continue so that all pilgrims are well looked after when they visit.',
        'The economy. The economy will grow and expand into new sectors. A dynamic business environment with upgraded services and facilities will offer opportunities for investment and attract large and small businesses from different countries. The geographical position of the Kingdom will help make it an international trade and transportation centre that connects Europe, Africa and Asia.',
        'Telecommunications and information technology will be updated and made available in urban and rural areas. This will provide additional access to information and employment opportunities for citizens who live in remote areas. Government services will be streamlined to support the establishment and the operation of new enterprises in different sectors, and this renewed environment will increase opportunities for citizens and attract investors from all over the world.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Past perfect',
      rule: 'Use had + past participle to show that one past action happened before another past action.',
      examples: [
        'When we arrived at the airport, our flight had already left.',
        'They couldn\'t get in the house because they had forgotten the key.',
      ],
    },
    {
      skill: 'grammar',
      title: 'Speculating with modals',
      rule: 'Use must when you are sure, may / might / could when something is possible, and can\'t / couldn\'t when you think it is impossible. For the past, add have + past participle.',
      examples: [
        'It must be a helicopter.',
        "It can't be a balloon.",
        'It must have been a helicopter.',
      ],
    },
    {
      skill: 'form',
      title: 'Necessity and lack of necessity',
      rule: 'Use must, have to and need to for necessity. Use don\'t need to and needn\'t for lack of necessity.',
      examples: [
        'You have to call an expert to get their opinion.',
        "You don't need to (needn't) worry.",
      ],
    },
  ],
  questions: B.done(),
};
