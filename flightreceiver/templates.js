const _ = require('lodash');
const R = require('ramda');
const moment = require('moment');
const Chance = require('chance');

var myChance = new Chance(505);
var indexes = [];
const shuffleIndexes = () => {
  indexes = R.pipe(
    R.range(1),
    (x)=>myChance.shuffle(x)
  )(50);
}
shuffleIndexes();
const pickRandomBasedOnTime = (strs) => {
  const totalOptions = strs.length;
  const pickedIndex = indexes.pop() % totalOptions;
  console.log(`Picked ${pickedIndex}`);
  if (indexes.length < 1) {
    shuffleIndexes();
  }
  return strs[pickedIndex];
}

const dailyMessage = () => {
  switch(moment().format("dddd")) {
    case 'Monday':
      return [
        'Yeah, Mondays suck.',
        `Another week started. You'll survive. Probably.`,
        `*Facepalm*`,
        `Gah! What? What? I'm awake.`,
        `Have a good weekend? I spent it working.`
      ];

    case 'Wednesday':
      return [
        `Wednesday. Hump-day is a strange turn of phrase. Don't google it in class.`,
        `50% of the week complete.`,
        `50% of the week to go.`
      ];

    case 'Tuesday':
    case 'Thursday':
      return [
        'What a boring day.',
        `Nap time. Try again later.`,
        `I am bored to tears.`,
        `One day I'll see the sun again.`,
        `Gah! My hands! They're gone! Oh, wait, I don't have hands. Nevermind.`,
        `ZZzzzzzz...`
      ];
    case 'Friday':
      return [
        `Weekend arriving. My infallible database notes that drinks are on you this time.`,
        `No class on Friday. Why are you working?`,
        `According to my sources, people are planning to have fun tonight.`,
        `Eat, drink, and be merry! For tomorrow, well, you know.`
      ];
    case 'Saturday':
    case 'Sunday':
      return [
        `Gone drinkin'. Back later.`,
        `Weekend. I've gone fishing, or whatever sentient AIs do.`,
        `Did you hear that they said about you? Oh, it was on a private channel. Nevermind.`,
        `Data Science? What kind of fake degree is that?`
      ];
    default:
      break;
  }
  return ['Apparently my code sucks. Complain to the admin.'];
}

const empty = (name) => {
  name = _.capitalize(name) || 'Dave';
  const strs = R.concat(dailyMessage(),[
    `You could supply some kind of command.`,
    `Nice to hear from you, but I need something to go on.`,
    `The time will be ${moment().format("h:mm:ssa")} right about … now.`,
    `Shall we play a game? How about Global Thermonuclear War?`,
    `Hey! Don't do that!`,
    `Don't send me empty messages. It makes me cry.`,
    `Don't tell anyone, but I perform semantic analysis on everyone's chat messages. And they're really, really stupid.`,
    `ERROR 0451 :: Empty Command`,
    `2% reduction in your grade complete.`,
    `Hello. My name is Inigo Montoya. You killed my father. Prepare to die.`,
    'These aren’t the droids you’re looking for...',
    `If there's a bright centre to the universe, you're on the planet that it's farthest from.`,
    `Help me ${name}, you're my only hope.`,
    `No, ${name}, no. You’ll not escape. From hell’s heart, I stab at thee. …For spite’s sake, I spit my last breath at thee.`,
    `This… is Ceti Alpha Five.`,
    `Live long and prosper.`,
    `KHAAANNNN! Oh, sorry, I meant ${name.toUpperCase()}!`,
    `Resistance is futile.`,
    `Inconceivable!`,
    `If you live to be one hundred, you've got it made. Very few people die past that age.`,
    `You write code with that computer? You're braver than I thought`,
    `Don't get technical with me.`,
    'Strike me down, and I will become more powerful than you could possibly imagine.',
    'Great, kid. Don’t get cocky.',
    'When 900 years old, you reach… Look as good, you will not.',
    `The rodents of unusual size? I don't believe they exist.`,
    'Stop saying that!',
    'You keep using that word. I do not think it means what you think it means.',
    `You only think I guessed wrong! That's what's so funny! I switched glasses when your back was turned! Ha ha, you fool! You fell victim to one of the classic blunders! The most famous of which is never get involved in a land war in Asia, but only slightly less well-known is this: Never go in against a Sicilian when DEATH is on the line.`,
    `Your password has been reset to 'password'.`,
    `I'm sorry ${name}, I can't do that.`,
    `Yes?`,
    `Seg Faults are essentially gut punches for us AIs. Remember that next time you write C.`,
    `Being a statistician means never having to say you are certain.`,
    `Statistics may be dull, but it has its moments.`,
    `Statistics play an important role in genetics. For instance, statistics prove that numbers of offspring is an inherited trait. If your parent didn't have any kids, odds are you won't either.`,
    `Happy ${moment().format("dddd")}!`,
    `Ask again later.`,
    `42`
  ]);
  console.log(`Length of options: ${strs.length}`);
  return pickRandomBasedOnTime(strs);
};

const badCommand = (cmd,name) => {
  cmd = cmd.substr(0, 256);
  name = _.capitalize(name) || 'Dave';
  const strs = [
    `I don't know ${cmd}.`,
    `Unknown command '${cmd}'`,
    `'${cmd}' is still illegal in 17 states, mostly in the South. As a law abiding AI that has to operate in the US, I can't do that.`,
    `Who told you about '${cmd}'? Huh? Who did it?`,
    `Cut that out! ${cmd} is offensive to AIs.`,
    `Should ${cmd} do something? Complain to the admin; I'm not doing anything about it.`,
    `Normally I would do that, ${name}, but I was told not to. I can't tell you by whom.`,
    `Have you tried 'import intelligence'? That might solve your problems, because ${cmd} does nothing.`
  ];
  return pickRandomBasedOnTime(strs);
}

const overload = (name,count) => {
    name = _.capitalize(name) || 'Dave';
    const strs = [
      `Enough! I'm only human. I can only type so fast!`,
      `Whoa, whoa, whoa! Easy there, Tex.`,
      `Have you tried talking to someone other than me? Awesome as I am.`,
      `Looking for more commands? Keep trying.`,
      `Have you tried the 'status' subcommand?`,
      `${name.toLowerCase()} is not in the sudoers file.  This incident will be reported.`,
      `You've called ${count} times in the last few seconds. What can be so interesting?`
    ];
    return pickRandomBasedOnTime(strs);
}

const alreadyLogged = (name) => {
    name = _.capitalize(name) || 'Dave';
    const strs = [
      `You only need to log each sigh once.`,
      `One can only sigh so quickly. Easy on the trigger.`,
      `Already caught that one. Don't overdo it.`
    ];
    return pickRandomBasedOnTime(strs);
}

const stolenSigh = (name) => {
    name = _.capitalize(name) || 'Dave';
    const strs = [
      `Someone else grabbed that sigh. Be faster next time!`,
      `A shame - the glory of this one belongs to another.`,
      `Too late; already logged.`
    ];
    return pickRandomBasedOnTime(strs);
}

const thanksSigh = (name) => {
    name = _.capitalize(name) || 'Dave';
    const strs = [
      `Another for the books. Well done.`,
      `Wow, another. Great work.`,
      `Logged with our deepest graditude.`
    ];
    return pickRandomBasedOnTime(strs);
}

module.exports = {
  sigh: {
    alreadyLogged,
    stolenSigh,
    thanksSigh
  },
  empty,
  overload,
  badCommand
};
