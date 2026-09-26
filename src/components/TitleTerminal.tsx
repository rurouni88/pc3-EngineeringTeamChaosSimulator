// TitleTerminal — satirical fake-terminal typewriter loop for the title
// screen. Ported from d20().devLife's startAsciiLoop to React.

import { useEffect, useRef, useState } from 'react';

const SCENES: string[][] = [
  ['$ etcs --quarter', 'loading 12 archetypes...', 'standup: cancelled (again)', 'prod: ON FIRE', 'you: "it\'s a feature"'],
  ['EM: blockers?', 'you: none!', '(47 tabs, 1 coffee)', 'EM: great energy', 'you: ██████░░░░ 60%'],
  ['intern ──────> vendor', 'onboarding: pending', 'budget: -30%', 'you: still here??', '...legend.'],
];

export function TitleTerminal() {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(true);
  const raf = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      for (;;) {
        if (cancelled) return;
        for (const scene of SCENES) {
          let out = '';
          for (const line of scene) {
            if (cancelled) return;
            for (const ch of line) {
              out += ch;
              setText(out);
              await sleep(18);
            }
            out += '\n';
            setText(out);
            await sleep(140);
          }
          await sleep(2600);
          if (cancelled) return;
          setText('');
        }
      }
    })();

    const onVis = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div
      className={`w-full max-w-md bg-black/60 border border-slate-800 rounded-lg p-3 font-mono text-[10px] sm:text-xs text-green-400/90 leading-relaxed whitespace-pre-wrap overflow-hidden transition-opacity ${visible ? '' : 'opacity-30'}`}
    >
      <div className="text-slate-600 border-b border-slate-800 pb-1 mb-2">
        etcs — ~/quarter
      </div>
      {text}
      <span className="animate-pulse">▌</span>
    </div>
  );
}
