import { pick } from './util';

interface SatiricalTemplates {
  gitCommits: Record<string, string[]>;
  slackRants: Record<string, string[]>;
  highBurnout: string[];
}

/** Pre-compiled satirical text, keyed by archetype id. */
const TEXT_MATRIX: SatiricalTemplates = {
  gitCommits: {
    rockstar: [
      'rewrote the entire module in Rust. you are welcome',
      'hotfix. do not ask questions',
      'refactor (14 files, 0 tests, infinite confidence)',
      'pushed directly to main, staging is for cowards',
    ],
    grindset: [
      'committed at 2:47am. that is 6 commits ahead of all of you',
      'still here. the chair has my shape now',
      'lunch? what is lunch',
    ],
    architect: [
      'added a microservice for the microservice',
      'new diagram. old problems. same budget',
      'extracted interface. interface now has an interface',
    ],
    zen: [
      'shipped it, gently',
      'removed 3 alerts. added 1 breath',
      'the build passes. this is enough',
    ],
    imposter: [
      'i think this fixes it? please do not fire me',
      'minor cleanups (sorry if i broke everything)',
      'reverted my revert. now which one was the bug',
    ],
    slackwiz: [
      'it is fine, I will do it tonight',
      'afk: 9 hours. output: 300%. you are welcome',
      'shipped while you were in standup',
    ],
    framework: [
      'upgraded everything to v2. nothing was asked',
      'migration script (the codebase is now a new codebase)',
      'pinned nothing. that is the point',
    ],
    zealot: [
      'wrote 200 tests. feature: eventually',
      'coverage is now 99.1%. so is my blood pressure',
      'the bug you reported is now a regression test named after you',
    ],
    intern: [
      'first commit! please be gentle',
      'fixed the bug (and created two more, my bad)',
      'learning the codebase (day 4, still scared)',
    ],
    vendor: [
      'delivered! (invoice attached, net-15)',
      'premium tier hotfix (that is a $40k feature)',
    ],
    security: [
      'blocked deploy: 3 findings, 1 critical (the critical one is cultural)',
      'rotated all credentials. again.',
    ],
    devrel: [
      'updated the conference deck (the code will follow. eventually.)',
      'demo environment is a lifestyle choice',
    ],
  },
  slackRants: {
    intern: [
      'quick question... actual important question',
      'I broke staging. I can fix it. probably.',
    ],
    vendor: [
      'this is actually a great upsell opportunity',
      'our SLA does not cover vibes',
    ],
    security: [
      'no. and I will explain why in writing',
      'your API key is in the repo and I am feeling things',
    ],
    devrel: [
      'giving a talk on this product NEXT WEEK. ship it. spiritually.',
      'the demo is the product, the product is the demo',
    ],
    rockstar: [
      'your code review is a speed bump on my path to greatness',
      "I don't take feedback, I take pull requests",
    ],
    grindset: [
      'I have slept 4 hours in 9 days and I am FINE',
      'my heart rate monitor is just a productivity tool',
    ],
    architect: [
      'we do not have a tech debt problem, we have a vision problem',
      'the monolith is a design choice. your feelings are a design choice',
    ],
    zen: [
      'I will be declining this urgency with compassion',
      "deadline? that is a very aggressive energy",
    ],
    imposter: [
      'everyone is so much better at this than me, I can tell',
      "I'm pretty sure I am the bug",
    ],
    slackwiz: [
      "I'm not slacking, I'm compiling in my head",
      'you see a man doing nothing. you see a man loading',
    ],
    framework: [
      "we don't need this feature, we need the new framework",
      'the old stack is a prison and I have the key',
    ],
    zealot: [
      'I will not ship code that I have not personally interrogated',
      "your 'quick fix' failed 14 of my tests. we need to talk",
    ],
  },
  highBurnout: [
    'If I see one more story point added to this sprint I am throwing my laptop into the ocean.',
    'Who refactored the auth module? It looks like a crime scene.',
    'Going AFK for 4 hours to attend a mandatory mindfulness seminar about workplace stress.',
    'I am one Jira ticket away from a new career.',
    'My therapist asked about coping mechanisms. I showed her the on-call rotation.',
  ],
};

/** Deterministic-flavored text selection: burnout wins, then trait. */
export function generateDevActionText(
  quirk: string,
  burnout: number,
  devName: string,
  context: 'work' | 'idle',
): string {
  if (burnout > 80) {
    const rant = pick(TEXT_MATRIX.highBurnout);
    return `[SLACK] **${devName}**: ${rant}`;
  }
  if (context === 'work') {
    const commits = TEXT_MATRIX.gitCommits[quirk] ?? ['fixed stuff'];
    return `[GIT] **${devName}** committed: "${pick(commits)}"`;
  }
  const rants = TEXT_MATRIX.slackRants[quirk] ?? ['...'];
  return `[SLACK] **${devName}**: ${pick(rants)}`;
}
