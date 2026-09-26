// Headless smoke test: runs full games and prints end states.
import { newGame, runGameTick, actions } from '../src/engine/GameEngine.ts';
import { stability } from '../src/engine/util.ts';

function play(role: 'PO' | 'EM' | 'CIO', label: string) {
  let s = newGame(role);
  // naive bot: assign idle engineers to backlog tickets
  const assignBot = () => {
    // bugs first (stability), then oldest deadline
    const unassigned = () =>
      s.tickets
        .filter((x) => !s.engineers.some((o) => o.assignedTicketId === x.id))
        .sort((a, b) => (a.type === 'bug' ? -1 : 1) - (b.type === 'bug' ? -1 : 1) || a.deadline - b.deadline);
    for (const e of s.engineers) {
      if (e.energy < 40 && e.assignedTicketId !== null) {
        s = actions.assign(s, e.assignedTicketId, null); // rest day
        continue;
      }
      if (e.assignedTicketId === null) {
        const t = unassigned()[0];
        if (t) s = actions.assign(s, t.id, e.id);
      }
    }
    // EM: mediate stuck reviews; PO: spec the least clear ticket
    if (role === 'EM' && s.ap > 0) {
      const stuck = s.tickets.find((t) => t.stuckInReview);
      if (stuck) s = actions.mediate(s, stuck.id);
      if (!s.guidelinesEnforced) s = actions.toggleGuidelines(s);
    }
    if (role === 'PO' && s.ap > 0) {
      const overdue = s.tickets.filter((t) => t.deadline < s.day);
      if (overdue.length > 4) s = actions.cutScope(s, overdue[0].id); // stop the bleeding
      if (s.tickets.length < 3) s = actions.addTicket(s);
      const vague = [...s.tickets].sort((a, b) => a.specClarity - b.specClarity)[0];
      if (vague && vague.specClarity < 80) s = actions.writeSpec(s, vague.id);
    }
    if (role === 'CIO' && s.ap > 0) {
      const avgBurn = s.engineers.reduce((x, e) => x + e.burnout, 0) / Math.max(1, s.engineers.length);
      if (avgBurn > 60 && s.budget > 200) s = actions.hire(s);
      if (stability(s) < 45 && s.budget > 200) s = actions.investInfra(s);
    }
  };

  let guard = 0;
  while (!s.gameOver && guard++ < 30 * 8 * 3) {
    s = runGameTick(s);
    if (s.hour === 1) assignBot();
  }
  const shipped = s.log.filter((l) => l.text.includes('shipped')).length;
  console.log(
    `${label}: ended=${s.gameOver} day=${s.day} stab=${stability(s)} budget=$${s.budget}k team=${s.engineers.length} shipped=${shipped} slackMsgs=${s.slack.length}`,
  );
}

for (let i = 0; i < 5; i++) play('PO', `PO run ${i + 1}`);
for (let i = 0; i < 5; i++) play('EM', `EM run ${i + 1}`);
for (let i = 0; i < 5; i++) play('CIO', `CIO run ${i + 1}`);
