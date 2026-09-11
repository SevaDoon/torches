/*
 * Picture questions, kept in one file so the photos and the words that name
 * them stay together. curriculum/index.ts appends them to their units.
 *
 * Every word here is concrete vocabulary from that unit of the Student Book —
 * the picture games teach the same list, they don't add a new one. English
 * hints live here; the Arabic the student actually reads is in data/i18n.
 */
import { builder } from '../authoring';
import type { Question } from '../../types';

function unit2(): Question[] {
  const B = builder('unit-2', 'pic-2');
  B.section('vocabulary', '1 Listen and Discuss');

  B.pic({
    pic: 'microscope',
    o: ['a microscope', 'a test tube', 'a sculpture', 'a showroom'],
    a: 0,
    d: 2,
    ex: 'A food scientist in Unit 2 uses a microscope and test tubes to create new flavours.',
    h: [
      'It makes very small things look big.',
      'Unit 2 describes a food scientist working in a lab.',
      'Example: Matthew has been working as a food scientist for three years.',
    ],
  });

  B.pic({
    pic: 'camera',
    o: ['a camera', 'an animator', 'a blueprint', 'a résumé'],
    a: 0,
    d: 1,
    ex: 'Unit 2 mentions being good at taking pictures — a camera is what you take them with.',
    h: [
      'You use it to take pictures.',
      'Unit 2 talks about being interested in photography as a career.',
      "Example: He's good at taking pictures, and he's interested in becoming a photographer.",
    ],
  });

  return B.done();
}

function unit3(): Question[] {
  const B = builder('unit-3', 'pic-3');
  B.section('vocabulary', '1 Listen and Discuss');

  B.pic({
    pic: 'robot',
    o: ['a robot', 'a rocket', 'an appliance', 'a satellite'],
    a: 0,
    d: 1,
    ex: 'A robot is a machine that does work on its own — the Unit 3 house comes with one that does the cleaning.',
    h: [
      'Look at the arms and the square head.',
      'Unit 3 describes an intelligent house with a machine that cleans for you.',
      'Example: The house will come equipped with a robot.',
    ],
  });

  B.pic({
    pic: 'rocket',
    o: ['a rocket', 'a submarine', 'a skyscraper', 'a tentacle'],
    a: 0,
    d: 1,
    ex: 'A rocket travels up into space. A submarine does the opposite — it travels under water.',
    h: [
      'Does this thing go up into the sky, or under the sea?',
      'Unit 3 talks about space exploration and travel.',
      'Example: The Russians launched the first artificial satellite in 1957.',
    ],
  });

  B.picmat({
    pairs: [
      ['submarine', 'a submarine'],
      ['skyscraper', 'a skyscraper'],
      ['robot', 'a robot'],
      ['rocket', 'a rocket'],
    ],
    d: 2,
    ex: 'These four appear in the Unit 3 texts about Jules Verne and the inventions he imagined.',
    h: [
      'Start with the picture whose word you are surest of.',
      'A submarine goes under water, a rocket goes to space, a skyscraper is a very tall building.',
      'Example: Jules Verne imagined submarines long before they existed.',
    ],
  });

  return B.done();
}

function unit4(): Question[] {
  const B = builder('unit-4', 'pic-4');
  B.section('vocabulary', '1 Listen and Discuss');

  B.pic({
    pic: 'suitcase',
    o: ['a suitcase', 'a bicycle', 'an appliance', 'a showroom'],
    a: 0,
    d: 1,
    ex: 'The Unit 4 product pages describe the Henk — the most expensive suitcase in the world.',
    h: [
      'You carry it with you when you travel.',
      'Unit 4 describes a travel bag with titanium wheels.',
      'Example: The suitcase was developed in the Netherlands.',
    ],
  });

  B.pic({
    pic: 'bicycle',
    o: ['a bicycle', 'a compact car', 'a submarine', 'a skyscraper'],
    a: 0,
    d: 1,
    ex: 'Unit 4 compares a fold-up bicycle with a regular one: it is smaller and less bulky.',
    h: [
      'Two wheels and pedals.',
      'Unit 4 compares a folding one with a regular one.',
      'Example: The fold-up bicycle is not as bulky as a regular bicycle.',
    ],
  });

  return B.done();
}

function unit5(): Question[] {
  const B = builder('unit-5', 'pic-5');
  B.section('vocabulary', '1 Listen and Discuss');

  B.pic({
    pic: 'helmet',
    o: ['a helmet', 'a seat belt', 'a knee pad', 'a bandage'],
    a: 0,
    d: 1,
    ex: 'A helmet protects the head. Knee pads protect the knees, and a seat belt holds you in a car.',
    h: [
      'Which part of the body does it protect?',
      'Unit 5 lists the safety equipment: helmet, knee pads, seat belt.',
      'Example: Were you wearing a helmet? — Yes, luckily I was.',
    ],
  });

  B.pic({
    pic: 'trafficLight',
    o: ['a traffic light', 'an intersection', 'a speed limit', 'a windshield'],
    a: 0,
    d: 2,
    ex: 'A traffic light tells drivers when to stop and go. An intersection is where two roads cross.',
    h: [
      'Three colours: red, amber and green.',
      'Unit 5 says the law makes you stop at it.',
      'Example: You must stop at the traffic lights.',
    ],
  });

  return B.done();
}

function unit6(): Question[] {
  const B = builder('unit-6', 'pic-6');
  B.section('vocabulary', '1 Listen and Discuss');

  B.picmat({
    pairs: [
      ['apple', 'nutritious food'],
      ['bottle', 'a bottle of water'],
      ['clock', 'a clock'],
      ['book', 'a book'],
    ],
    d: 1,
    ex: 'Everyday words from the Unit 6 advice about healthy habits and daily routine.',
    h: [
      'Start with the clearest picture.',
      'Unit 6 talks about healthy food, drinking water, and using your time.',
      'Example: You deserve healthy and nutritious food.',
    ],
  });

  return B.done();
}

function unit9(): Question[] {
  const B = builder('unit-9', 'pic-9');
  B.section('vocabulary', '1 Listen and Discuss');

  B.pic({
    pic: 'faucet',
    o: ['a dripping faucet', 'a flat tire', 'a broken windowpane', 'a torn sleeve'],
    a: 0,
    d: 1,
    ex: 'A dripping faucet keeps letting water out — one of the household complaints in Unit 9.',
    h: [
      'Look at the drop of water under it.',
      'Unit 9 lists household complaints: the tap, the glass, the tire.',
      'Example: The faucet is dripping. It needs to be fixed.',
    ],
  });

  B.pic({
    pic: 'flatTire',
    o: ['a flat tire', 'a dead battery', 'a cracked windshield', 'a dripping faucet'],
    a: 0,
    d: 2,
    ex: 'A flat tire has lost its air. A dead battery has lost its power — both are car complaints in Unit 9.',
    h: [
      'The tire is squashed at the bottom. What has it lost?',
      'Unit 9 separates a tire problem from a battery problem.',
      'Example: I had a flat tire on the way to school.',
    ],
  });

  B.picmat({
    pairs: [
      ['faucet', 'a dripping faucet'],
      ['brokenWindow', 'a broken windowpane'],
      ['flatTire', 'a flat tire'],
      ['bulb', 'a light bulb'],
    ],
    d: 2,
    ex: 'Four of the things that "need to be fixed" in the Unit 9 complaints.',
    h: [
      'Match the picture you know first.',
      'Every picture here is something broken that needs fixing in Unit 9.',
      'Example: There is a broken windowpane. I will have it fixed right away.',
    ],
  });

  return B.done();
}

/** unitId -> extra picture questions appended to that unit. */
export const PICTURE_QUESTIONS: Record<string, Question[]> = {
  'unit-2': unit2(),
  'unit-3': unit3(),
  'unit-4': unit4(),
  'unit-5': unit5(),
  'unit-6': unit6(),
  'unit-9': unit9(),
};
