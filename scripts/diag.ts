import { newGame, runGameTick, actions } from '../src/engine/GameEngine.ts';
import { stability } from '../src/engine/util.ts';

let s = newGame('EM');
const unassigned = () =>
  s.tickets
    .filter((x) => !s.engineers.some((o) => o.assignedTicketId === x.id))
    .sort((a, b) => (a.type === 'bug' ? -1 : 1) - (b.type === 'bug' ? -1 : 1) || a.deadline - b.deadline);

for (let i = 0; i < 30 * 8 && !s.gameOver; i++) {
  s = runGameTick(s);
  if (s.hour === 1) {
    for (const e of s.engineers) {
      if (e.energy < 40 && e.assignedTicketId !== null) { s = actions.assign(s, e.assignedTicketId, null); continue; }
      if (e.assignedTicketId === null) { const t = unassigned()[0]; if (t) s = actions.assign(s, t.id, e.id); }
    }
    if (s.ap > 0) {
      const stuck = s.tickets.find((t) => t.stuckInReview);
      if (stuck) s = actions.mediate(s, stuck.id);
      if (!s.guidelinesEnforced) s = actions.toggleGuidelines(s);
    }
    if (s.day % 5 === 1) {
      const stages = ['backlog', 'inprogress', 'qa', 'production'].map(
        (st) => `${st}:${s.tickets.filter((t) => t.stage === st).length}`,
      ).join(' ');
      const stuck = s.tickets.filter((t) => t.stuckInReview).length;
      const overdue = s.tickets.filter((t) => t.deadline < s.day).length;
      const eng = s.engineers.map((e) => `${e.name}(e${Math.round(e.energy)},b${Math.round(e.burnout)},${e.status})`).join(' ');
      console.log(`d${s.day} stab=${stability(s)} [${stages}] stuck=${stuck} overdue=${overdue} | ${eng}`);
    }
  }
}
console.log('END', s.gameOver, 'shipped=', s.log.filter((l) => l.text.includes('shipped')).length);
console.log(s.log.slice(0, 15).map((l) => l.text).join('\n'));
