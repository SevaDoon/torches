import { builder } from '../authoring';
import type { Unit } from '../../types';

const B = builder('unit-5');

B.section('grammar', '3 Grammar');

B.mc({
  q: 'Sarah cut ___ while she was peeling potatoes.',
  o: ['herself', 'himself', 'yourself', 'themselves'],
  a: 0,
  d: 1,
  ex: 'A reflexive pronoun is used when the subject and the object are the same person. Sarah is she, so the pronoun is herself.',
  h: [
    'Who did the cutting, and who was cut?',
    'Use a reflexive pronoun when the subject and the object are the same person.',
    'Example: He likes to look at himself in the mirror.',
  ],
});

B.mc({
  q: 'The people injured ___ when they were escaping from the bull.',
  o: ['themselves', 'himself', 'ourselves', 'itself'],
  a: 0,
  d: 1,
  ex: 'The subject "the people" is plural and third person, so the reflexive pronoun is themselves.',
  h: [
    'Is the subject one person or many?',
    'Plural reflexive pronouns: ourselves, yourselves, themselves.',
    'Example: We saw ourselves on Channel 9.',
  ],
});

B.blk({
  q: 'The instructions on the box say: "Do it ___." (without anyone\'s help)',
  a: ['yourself'],
  d: 2,
  ex: 'A reflexive pronoun can also mean "without anyone\'s help".',
  h: [
    'The box is speaking directly to the reader.',
    'Reflexive pronouns can mean "without help": I fixed the hair dryer myself.',
    'Example: Do it yourself.',
  ],
});

B.mc({
  q: 'Jake burned his arm, ___ he went to the emergency room.',
  o: ['so', 'because', 'although', 'while'],
  a: 0,
  d: 1,
  ex: 'So introduces a consequence or a result. Because introduces a reason.',
  h: [
    'Which half of the sentence is the result?',
    'because = why. so = the result.',
    'Example: Jake went to the emergency room because he burned his arm.',
  ],
});

B.mc({
  q: 'Most accidents happen ___ people don\'t pay attention.',
  o: ['because', 'so', 'but', 'while'],
  a: 0,
  d: 1,
  ex: 'Because introduces the reason for what happened.',
  h: [
    'Not paying attention is the cause, not the result.',
    'because = the reason; so = the consequence.',
    'Example: He didn\'t turn off the electricity, so he got a shock.',
  ],
});

B.mc({
  q: 'A: I burned myself on the stove. B: ___',
  o: ['So did I.', 'Neither did I.', 'So am I.', 'Neither am I.'],
  a: 0,
  d: 2,
  ex: 'So shows agreement with an affirmative statement, and the auxiliary matches the tense — here, the simple past, so did.',
  h: [
    'Two things must match: positive or negative, and the tense of the verb.',
    'So... agrees with an affirmative statement; neither... agrees with a negative one.',
    'Example: I hurt myself all the time. — So do I.',
  ],
});

B.mc({
  q: 'A: I\'ve never broken an arm or a leg. B: ___',
  o: ['Neither have I.', 'So have I.', 'Neither did I.', 'So do I.'],
  a: 0,
  d: 2,
  ex: 'The statement is negative and in the present perfect, so the agreement is Neither + have + I.',
  h: [
    'Look at the auxiliary in the first sentence and reuse it.',
    'Negative statement → Neither + auxiliary + subject.',
    'Example: I didn\'t slip on the wet floor. — Neither did I.',
  ],
});

B.mc({
  q: 'A: I\'m not an aggressive driver. B: ___',
  o: ['Neither am I.', 'So am I.', 'Neither do I.', 'So do I.'],
  a: 0,
  d: 2,
  ex: 'The verb in the statement is the verb be, so the agreement uses am, and the statement is negative, so it uses neither.',
  h: [
    'Which verb is in the first sentence — be, do or have?',
    'The agreement copies the auxiliary or the verb be from the statement.',
    'Example: I\'m a careful driver. — So am I.',
  ],
});

B.ord({
  q: 'Join the two ideas with because.',
  c: ['Ahmed', 'slipped and fell', 'because', 'the floor', 'was wet', '.'],
  d: 2,
  ex: 'Because introduces the reason, and the reason clause follows the result clause here.',
  h: [
    'The reason always follows the word because.',
    'result + because + reason.',
    'Example: I put my hand under cold water because I burned myself.',
  ],
});

B.err({
  t: ['They', "didn't", 'hurt', 'theirselves', 'because', 'they', 'were', 'wearing', 'seat', 'belts', '.'],
  a: 3,
  fix: 'themselves',
  d: 2,
  ex: 'The correct reflexive pronoun for they is themselves; "theirselves" is not an English word.',
  h: [
    'One word in this sentence does not exist in English.',
    'The reflexive pronouns are: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves.',
    'Example: They didn\'t hurt themselves.',
  ],
});

B.mc({
  q: 'You ___ stop at the traffic lights. (a law)',
  o: ['must', 'should', 'might', 'could'],
  a: 0,
  d: 1,
  ex: 'Must is used for laws and rules; should is used for advice.',
  h: [
    'A traffic light is not a suggestion.',
    'Use must for laws and rules; use should for advice.',
    'Example: You should drive under the speed limit.',
  ],
});

B.section('vocabulary', '1 Listen and Discuss');

B.mat({
  q: 'Match each injury verb with what happens.',
  pairs: [
    ['sprain', 'twist a joint such as an ankle'],
    ['fracture', 'crack or break a bone'],
    ['burn', 'hurt the skin with heat or fire'],
    ['slip', 'lose your balance on a smooth surface'],
    ['poke', 'push something sharp into a place'],
  ],
  d: 2,
  ex: 'These are the injury verbs listed in the Unit 5 vocabulary and Language in Context sections.',
  h: [
    'Start with the verb you have heard most often.',
    'Each verb names a different kind of accident.',
    'Example: I once slipped on a wet floor and broke my arm.',
  ],
});

B.mem({
  q: 'Find the pairs: cause of a car crash and its description.',
  pairs: [
    ['distracted drivers', 'they take their eyes off the road'],
    ['driver fatigue', 'drowsy drivers may fall asleep at the wheel'],
    ['speeding', 'less time is left to avoid a crash'],
    ['aggressive driving', 'tailgating and ignoring traffic signs'],
  ],
  d: 2,
  ex: 'These are four of the five common causes of automobile crashes listed in Unit 5.',
  h: [
    'Turn a card and hold the phrase in your head while you search.',
    'Each cause in the unit has a short explanation right underneath it.',
    'Example: Bad weather makes driving more difficult.',
  ],
});

B.mc({
  q: 'Tailgating means ___.',
  o: [
    'driving too close to the driver in front',
    'driving without a seat belt',
    'driving with the lights off',
    'parking on the sidewalk',
  ],
  a: 0,
  d: 2,
  ex: 'Tailgating is listed in Unit 5 as one of the behaviours of aggressive drivers.',
  h: [
    'The word contains "tail" — the back of the car in front.',
    'Tailgate = drive too close behind another car.',
    'Example: Aggressive drivers ignore the safety of others and take risks.',
  ],
});

B.mc({
  q: 'A driver who is ___ may misjudge traffic situations and fall asleep at the wheel.',
  o: ['drowsy', 'cautious', 'unconscious', 'severe'],
  a: 0,
  d: 2,
  ex: 'Drowsy means sleepy. Cautious means careful, which is the opposite of dangerous driving.',
  h: [
    'One of these words is the opposite of what the sentence needs.',
    'Drowsy = sleepy and tired.',
    'Example: The most common time to encounter tired drivers is between 11 p.m. and 8 a.m.',
  ],
});

B.blk({
  q: 'Because he was wearing a ___ and knee pads, he didn\'t hurt himself. (head protection)',
  a: ['helmet'],
  d: 1,
  ex: 'A helmet protects the head, and knee pads protect the knees.',
  h: [
    'The other protection in the sentence is for the knees.',
    'Safety equipment in Unit 5: helmet, knee pads, seat belt.',
    'Example: Were you wearing a helmet? — Yes, luckily I was.',
  ],
});

B.tf({
  q: 'Real Talk: "It was your lucky day" means the person had good fortune.',
  a: true,
  d: 1,
  ex: 'A lucky day is a day of good fortune — Jasem got off with only a few bruises.',
  h: [
    'Think about Jasem, who hit a tree and got only bruises.',
    'lucky day = a day of good fortune.',
    'Example: I got off lightly — only a few bruises.',
  ],
});

B.section('reading', '9 Reading', 'u5-p1');

B.mc({
  q: 'Why did the eagle drop the tortoise on the head of Aeschylus?',
  o: [
    'It thought his bald head was a rock.',
    'It was frightened by the man.',
    'It wanted to give him a gift.',
    'It had been hit by another bird.',
  ],
  a: 0,
  d: 2,
  ex: 'The eagle was trying to break the shell on a rock, and the bald head looked like a good rock.',
  h: [
    'The passage explains what the eagle was trying to do with the shell.',
    'A "why" question is usually answered by the sentence right after the event.',
    'Example: The bird was trying to break the tortoise\'s shell on a rock.',
  ],
});

B.mc({
  q: 'What happened to the German soldier who fell out of the plane?',
  o: [
    'The engine restarted and he landed back in his seat.',
    'His parachute opened just in time.',
    'He landed in a lake.',
    'Another plane caught him.',
  ],
  a: 0,
  d: 2,
  ex: 'While he was falling, the engine of the plane started again and he landed back in his own seat.',
  h: [
    'Look at the "Happy Endings" section, not the unhappy one.',
    'When a text has two sections, choose the right one before you read.',
    'Example: The pilot was then able to land the plane safely.',
  ],
});

B.tf({
  q: 'According to the passage, Bob Hail\'s backup parachute also failed to open.',
  a: true,
  d: 1,
  ex: 'Both parachutes failed, and he still walked away with only minor injuries.',
  h: [
    'Find the paragraph about the parachute jump.',
    'Check both halves of a true/false statement before you decide.',
    'Example: He hit the ground face first and walked away.',
  ],
});

B.mc({
  q: 'Where was the ostrich seen, according to the passage?',
  o: [
    'on a Saudi Arabian highway near Abha',
    'in a farm in Australia',
    'in a park in Brisbane',
    'on a beach in California',
  ],
  a: 0,
  d: 1,
  ex: 'The eight-foot ostrich was seen weaving through heavy traffic on a highway near Abha.',
  h: [
    'Scan for the word "ostrich" and read the sentence around it.',
    'Place names are easy to scan for — they start with a capital letter.',
    'Example: It had probably escaped from a farm.',
  ],
});

B.mc({
  q: 'Choose the meaning of "to weave through" as it is used in the passage.',
  o: [
    'to move through by turning and avoiding',
    'to make cloth',
    'to run in a straight line',
    'to stop suddenly',
  ],
  a: 0,
  d: 2,
  ex: 'The ostrich was weaving through heavy traffic — moving between the cars, turning to avoid them.',
  h: [
    'Picture the ostrich among moving cars. How does it have to move?',
    'Use the picture in your head to check a word meaning.',
    'Example: I swerved, lost my balance, and hit a tree.',
  ],
});

B.mc({
  q: 'Choose the meaning of "to recover" as it is used in the passage.',
  o: ['to get better', 'to cover again', 'to explode', 'to remember'],
  a: 0,
  d: 1,
  ex: 'Phineas Gage was unable to see out of his left eye, then his sight returned and he fully recovered.',
  h: [
    'The sentence before it says his sight returned.',
    'Recover = get better after an illness or injury.',
    'Example: After a while, his sight returned, and he fully recovered.',
  ],
});

B.section('form', '11 Form, Meaning and Function');

B.mc({
  q: 'How did he drive? He drove ___.',
  o: ['slowly', 'slow', 'more slow', 'slowness'],
  a: 0,
  d: 1,
  ex: 'Adverbs of manner are usually formed by adding -ly to the adjective, and they say how something is done.',
  h: [
    'The question asks "how", not "what kind of".',
    'Adverb of manner = adjective + -ly.',
    'Example: She walked quickly.',
  ],
});

B.mc({
  q: 'He is a good player. He plays ___.',
  o: ['well', 'good', 'goodly', 'better'],
  a: 0,
  d: 2,
  ex: 'Good is an adjective; its adverb form is the irregular word well.',
  h: [
    'This adjective does not simply add -ly.',
    'The adverb form of good is well.',
    'Example: My son Alexander drives well, but he sometimes drives too fast.',
  ],
});

B.mc({
  q: 'He is a fast driver. He drives ___.',
  o: ['fast', 'fastly', 'more fast', 'fastily'],
  a: 0,
  d: 2,
  ex: 'Some words have the same form as an adjective and as an adverb, such as fast and hard.',
  h: [
    'Try adding -ly and say the result out loud.',
    'Sometimes an adjective and an adverb have the same form: fast, hard.',
    'Example: He\'s a hard worker. He works hard.',
  ],
});

B.mc({
  q: 'The park is ___ the school. (on the opposite side of the road)',
  o: ['across from', 'between', 'next to', 'far from'],
  a: 0,
  d: 1,
  ex: 'Across from means on the opposite side.',
  h: [
    'Picture the two buildings facing each other.',
    'Prepositions of place: across from, between, next to, near, far from, on the corner.',
    'Example: The bank is between the post office and the restaurant.',
  ],
});

B.ord({
  q: 'Build the directions.',
  c: ['Go', 'straight', 'and take', 'a left', 'at the end of this street', '.'],
  d: 2,
  ex: 'Directions use imperatives: the base form of the verb with no subject.',
  h: [
    'Directions never start with "you".',
    'Imperatives for directions: Take a left. / Turn right. / Go straight.',
    'Example: Go straight down this corridor and take the elevator.',
  ],
});

B.blk({
  q: 'I live ___ the third floor. (building)',
  a: ['on'],
  d: 2,
  ex: 'Use in with a city, on with a floor of a building, and on with a street.',
  h: [
    'Three little prepositions divide up city, street and floor between them.',
    'in Jeddah (city), on the third floor (building), on First Avenue (street).',
    'Example: The accounts department is on the third floor.',
  ],
});

export const unit05: Unit = {
  id: 'unit-5',
  number: 5,
  title: 'Did You Hurt Yourself?',
  pages: '68–81',
  functions: [
    'Talk about accidents and accident prevention',
    'Talk about cause and effect',
    'Ask for and give directions',
  ],
  grammar: [
    'Reflexive pronouns',
    'Because versus so',
    'So and neither',
    'Modal auxiliaries must and should',
    'Adverbs of manner',
    'Prepositions of place; imperatives for directions',
  ],
  passages: [
    {
      id: 'u5-p1',
      unitId: 'unit-5',
      title: 'Unusual Accidents and Escapes',
      source: 'Written for Torches, based on the Unit 5 reading (Student Book pages 74–75).',
      paragraphs: [
        'Many people are interested in stories of unusual accidents. Some of these stories have happy endings, and some, unfortunately, do not.',
        'Unhappy endings. According to the legend, the ancient Greek playwright Aeschylus was killed when an eagle dropped a tortoise on his head. The bird was trying to break the shell of the tortoise on a rock in order to eat it, and Aeschylus was bald, so the eagle thought his head was a good rock. In another story, an eight-foot tall ostrich was seen weaving through heavy traffic on a Saudi Arabian highway near Abha. One of the drivers filmed the scene and uploaded it on the internet. Nobody tried to stop the 180-kilogram bird, which was taller than a person and ran at almost 70 kilometres per hour. It had probably escaped from a farm and run into heavy traffic instead of the wild.',
        'Happy endings. A German soldier was riding in the back seat of a plane during the First World War when the engine stalled as a result of an unusual gust of wind. He fell out of his seat while the plane was high above the ground. As he was falling, the engine of the plane started again, and he landed back in his own seat. The pilot was then able to land the plane safely.',
        'Bob Hail jumped out of an airplane in November 1972, but his main parachute failed to open. His backup parachute also failed. He dropped about 900 metres at 128 kilometres per hour and hit the ground face first. After a moment, he got up and walked away with only minor injuries. It was an amazing escape.',
        'Railroad worker Phineas P. Gage was working with some dynamite when it exploded unexpectedly. A metal bar one metre long went clear through his head. He remained conscious, but he was unable to see out of his left eye. After a while, his sight returned and he fully recovered.',
      ],
    },
  ],
  lessons: [
    {
      skill: 'grammar',
      title: 'Reflexive pronouns',
      rule: 'Use a reflexive pronoun when the subject and the object are the same person. They can also mean "without anyone\'s help".',
      examples: [
        'He likes to look at himself in the mirror.',
        'I fixed the hair dryer myself.',
        'They didn\'t hurt themselves because they were wearing seat belts.',
      ],
    },
    {
      skill: 'grammar',
      title: 'So and neither',
      rule: 'Use So + auxiliary + subject to agree with an affirmative statement, and Neither + auxiliary + subject to agree with a negative one. The auxiliary must match the statement.',
      examples: [
        'I burned myself on the stove. — So did I.',
        "I've never broken an arm. — Neither have I.",
        "I'm not an aggressive driver. — Neither am I.",
      ],
    },
    {
      skill: 'form',
      title: 'Because and so',
      rule: 'Because introduces a reason — it tells why. So introduces a consequence or a result.',
      examples: [
        "Most accidents happen because people don't pay attention.",
        "He didn't turn off the electricity, so he got a shock.",
      ],
    },
  ],
  questions: B.done(),
};
