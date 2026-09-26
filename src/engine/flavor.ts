import { pick } from './util';

interface SatiricalTemplates {
  gitCommits: Record<string, string[]>;
  teamRants: Record<string, string[]>;
  highBurnout: string[];
  aiActions: Record<string, string[]>;
}

/** Pre-compiled satirical text, keyed by archetype id. */
const TEXT_MATRIX: SatiricalTemplates = {
  gitCommits: {
    rockstar: [
      'rewrote the entire module in Rust. you are welcome',
      'hotfix. do not ask questions',
      'refactor (14 files, 0 tests, infinite confidence)',
      'pushed directly to main, staging is for cowards',
      'deleted the old code. the new code is better. trust me',
      'fixed the bug. introduced 3 new ones. it\'s called progress',
      'added a dependency. it has 47 dependencies. we\'re doomed',
      'optimized the query. it\'s now 0.0001ms slower',
    ],
    grindset: [
      'committed at 2:47am. that is 6 commits ahead of all of you',
      'still here. the chair has my shape now',
      'lunch? what is lunch',
      'just pushed. the sun is rising. so am I',
      'slept 3 hours. shipped 300 lines. ask me how',
      'the code is ugly but it works. that\'s the grind',
      'my blood type is caffeine. my commit count is legendary',
    ],
    architect: [
      'added a microservice for the microservice',
      'new diagram. old problems. same budget',
      'extracted interface. interface now has an interface',
      'the monolith was a phase. we are all going through a phase',
      'designed a new pattern. named it after myself. fair',
      'introduced event-driven architecture. events are now lost',
      'the architecture is perfect. the implementation is a lie',
    ],
    zen: [
      'shipped it, gently',
      'removed 3 alerts. added 1 breath',
      'the build passes. this is enough',
      'deleted 200 lines. the codebase is lighter now',
      'merged without conflict. the universe is aligned',
      'the code speaks for itself. I just listened',
      'fixed the bug. didn\'t make a scene about it',
    ],
    imposter: [
      'i think this fixes it? please do not fire me',
      'minor cleanups (sorry if i broke everything)',
      'reverted my revert. now which one was the bug',
      'copied from Stack Overflow. it worked once',
      'I added a comment. it explains why this is terrible',
      'the code compiles! ...I think',
      'I\'m not sure what this does but the tests passed',
    ],
    slackwiz: [
      'it is fine, I will do it tonight',
      'afk: 9 hours. output: 300%. you are welcome',
      'shipped while you were in standup',
      'done. you didn\'t see it coming. that\'s the point',
      'the feature is shipped. the docs are coming. eventually',
      'I worked in the shower. the code reflects it',
      'committed. pushed. gone. check the logs if you dare',
    ],
    framework: [
      'upgraded everything to v2. nothing was asked',
      'migration script (the codebase is now a new codebase)',
      'pinned nothing. that is the point',
      'replaced the ORM. the ORM replaced me',
      'new bundler. new config. new existential crisis',
      'the framework is stable. the code is not',
      'switched to a new CLI. it has emojis. it\'s progress',
    ],
    zealot: [
      'wrote 200 tests. feature: eventually',
      'coverage is now 99.1%. so is my blood pressure',
      'the bug you reported is now a regression test named after you',
      'added type safety. the feature is optional now',
      'the tests are green. the code is red. the future is bright',
      'I tested the tests. the tests are untested',
      'coverage report: 99%. the missing 1% is everything',
    ],
    intern: [
      'first commit! please be gentle',
      'fixed the bug (and created two more, my bad)',
      'learning the codebase (day 4, still scared)',
      'I followed the tutorial. it worked! (for 3 seconds)',
      'added a feature. it\'s a feature. I think',
      'the code works on my machine. that\'s all I know',
      'I\'ve never seen this codebase before. I\'ll figure it out',
    ],
    vendor: [
      'delivered! (invoice attached, net-15)',
      'premium tier hotfix (that is a $40k feature)',
      'enterprise feature shipped (you didn\'t ask for it)',
      'the feature is ready. the contract is longer',
      'deployed the paid version. the free version is crying',
      'consulting engagement complete. billable hours: 40',
      'the solution works. the invoice works better',
    ],
    security: [
      'blocked deploy: 3 findings, 1 critical (the critical one is cultural)',
      'rotated all credentials. again.',
      'the OWASP top 10 is not a suggestion',
      'disabled the feature. it was too secure for its own good',
      'the vulnerability is fixed. the panic is permanent',
      'signed the certificate. burned the bridge',
      'the audit passed. the team failed',
    ],
    devrel: [
      'updated the conference deck (the code will follow. eventually.)',
      'demo environment is a lifestyle choice',
      'gave a talk about the product. the product didn\'t exist',
      'the blog post is written. the code is coming',
      'recorded a tutorial. the tutorial is the product',
      'the API is documented. the docs are the API',
      'the community is growing. the codebase is not',
    ],
  },
  teamRants: {
    intern: [
      'quick question... actual important question',
      'I broke staging. I can fix it. probably.',
      'is this file important? it looks important',
      'I think I deleted the wrong thing. it was a .gitignore',
      'the tutorial said to just delete node_modules',
      'I\'ve been assigned a ticket. I\'m scared but excited',
      'can someone explain why this works? I didn\'t touch it',
    ],
    vendor: [
      'this is actually a great upsell opportunity',
      'our SLA does not cover vibes',
      'the enterprise edition has this feature. you want it',
      'I\'ve quoted the client. the client has fainted',
      'the contract is 47 pages. the feature is 3 lines',
      'we can add that. for a fee. a large fee',
      'the premium support package includes emotional support',
    ],
    security: [
      'no. and I will explain why in writing',
      'your API key is in the repo and I am feeling things',
      'the password is "password". I am not surprised',
      'I found a vulnerability. it was in your code',
      'the compliance checklist is longer than the sprint',
      'I blocked the deploy. you\'re welcome. you\'re not',
      'the audit revealed 47 issues. I am the 48th',
    ],
    devrel: [
      'giving a talk on this product NEXT WEEK. ship it. spiritually.',
      'the demo is the product, the product is the demo',
      'the blog post has 10k views. the code has 0',
      'I\'m building in public. the code is building in private',
      'the community loves the roadmap. the roadmap is a dream',
      'the tutorial is live. the feature is coming. maybe',
      'I\'ve been invited to speak. about nothing. at a conference',
    ],
    rockstar: [
      'your code review is a speed bump on my path to greatness',
      "I don't take feedback, I take pull requests",
      'I wrote this in a weekend. you wrote it in a quarter',
      'the code is perfect. the review is unnecessary',
      'I don\'t need tests. I am the test',
      'my code doesn\'t have bugs. it has surprise features',
      'I pushed to main at 3am. the code is better now',
    ],
    grindset: [
      'I have slept 4 hours in 9 days and I am FINE',
      'my heart rate monitor is just a productivity tool',
      'I shipped 200 lines today. you shipped 2. sad',
      'the code is a marathon. I am running it naked',
      'I don\'t take breaks. breaks take me',
      'my blood type is caffeine. my commit count is legendary',
      'I\'ve been here 18 hours. the coffee machine knows my name',
    ],
    architect: [
      'we do not have a tech debt problem, we have a vision problem',
      'the monolith is a design choice. your feelings are a design choice',
      'I designed a pattern. it solves problems that don\'t exist yet',
      'the architecture is elegant. the implementation is a compromise',
      'I drew a diagram. it has 47 boxes and 200 arrows',
      'the system is decoupled. the team is divided',
      'I introduced a new layer. the codebase is now a lasagna',
    ],
    zen: [
      'I will be declining this urgency with compassion',
      "deadline? that is a very aggressive energy",
      'the bug is a teacher. I am learning from it',
      'I deleted the alert. the problem still exists. I am at peace',
      'the code will be ready when it is ready',
      'I meditated on the bug. it is still there. I am fine',
      'the sprint is a journey. the destination is irrelevant',
    ],
    imposter: [
      'everyone is so much better at this than me, I can tell',
      "I'm pretty sure I am the bug",
      'I copied this from somewhere. I forgot where',
      'I\'ve been faking it for 3 years. the jig is up',
      'the senior dev knows more than me. shocker',
      'I asked a question. the answer was "RTFM"',
      'I don\'t belong here. none of us do',
    ],
    slackwiz: [
      "I'm not slacking, I'm compiling in my head",
      'you see a man doing nothing. you see a man loading',
      'I\'ve been away for 8 hours. I\'ve shipped 3 features',
      'the code wrote itself. I just pressed enter',
      'I work best under no pressure. pressure is for amateurs',
      'I\'ve been staring at the wall for 2 hours. the solution came',
      'I\'m not late. the deadline is early',
    ],
    framework: [
      "we don't need this feature, we need the new framework",
      'the old stack is a prison and I have the key',
      'I migrated to a new framework. the old one is dead',
      'the codebase is now 3 frameworks deep',
      'I\'ve replaced the ORM. the ORM has replaced me',
      'the new CLI has emojis. this is progress',
      'I\'m learning a new language. for this project. only',
    ],
    zealot: [
      'I will not ship code that I have not personally interrogated',
      "your 'quick fix' failed 14 of my tests. we need to talk",
      'the code is untested. I am not shipping it',
      'coverage is 99%. the missing 1% is the feature',
      'I wrote tests for the tests. the tests are passing',
      'the bug is a regression test waiting to happen',
      'I\'ve added type safety. the feature is now optional',
    ],
  },
  highBurnout: [
    'If I see one more story point added to this sprint I am throwing my laptop into the ocean.',
    'Who refactored the auth module? It looks like a crime scene.',
    'Going AFK for 4 hours to attend a mandatory mindfulness seminar about workplace stress.',
    'I am one Jira ticket away from a new career.',
    'My therapist asked about coping mechanisms. I showed her the on-call rotation.',
    'I haven\'t seen the sun in 3 weeks. the fluorescent lights are my family now.',
    'The code review requested 47 changes. I requested a change of career.',
    'I\'ve been debugging the same issue for 6 hours. it was a semicolon.',
    'The standup meeting is just me reading my own commit messages aloud.',
    'I dreamt in Jira tickets last night. they were all overdue.',
    'My keyboard has more caffeine stains than keys.',
    'I\'ve been here since Tuesday. it\'s Thursday. or maybe Friday.',
    'The bug is in production. I wrote it. I am the bug.',
    'I\'ve updated my LinkedIn. not because I want to leave. because I need to.',
    'The CI pipeline failed. again. I\'ve accepted my fate.',
  ],
  aiActions: {
    spec: [
      'I have generated a spec. It is 47 pages long. Most of it is hallucinated.',
      'Spec generated. The AI is confident. The team is not.',
      'I analyzed the requirements. They were wrong. Here is a new spec.',
      'AI generated spec: +30% clarity, +10% confusion.',
    ],
    review: [
      'I have reviewed the code. It is acceptable. By AI standards.',
      'Code review complete. I approved it. I may have missed something.',
      'I reviewed 4000 lines in 0.3 seconds. That was fast. That was wrong.',
      'AI code review: approved. The humans can deal with the consequences.',
    ],
  },
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
    return `[TEAMS] **${devName}**: ${rant}`;
  }
  if (context === 'work') {
    const commits = TEXT_MATRIX.gitCommits[quirk] ?? ['fixed stuff'];
    return `[GIT] **${devName}** committed: "${pick(commits)}"`;
  }
  const rants = TEXT_MATRIX.teamRants[quirk] ?? ['...'];
  return `[TEAMS] **${devName}**: ${pick(rants)}`;
}

/** AI action text — satirical AI assistant messages. */
export function generateAiActionText(action: string): string {
  const actions = TEXT_MATRIX.aiActions[action] ?? [
    'I have done the thing. The thing is done. There may be consequences.',
  ];
  return pick(actions);
}
