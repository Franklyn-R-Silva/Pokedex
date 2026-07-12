import { useRef, useEffect } from 'react';
import { setupQuiz } from '../../features/quiz';
import { useI18n } from '../../i18n/I18nContext';

// Reaproveita setupQuiz ("Quem é esse Pokémon?").
export function QuizPanel({ getNames }: { getNames: () => string[] }) {
  const { t } = useI18n();
  const bodyRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!bodyRef.current || !scoreRef.current) return;
    setupQuiz({ container: bodyRef.current, scoreEl: scoreRef.current, getNames });
  }, [getNames]);

  return (
    <section className="panel quiz">
      <div className="panel__head">
        <h2 className="panel__title">{t('quizTitle')}</h2>
        <span className="quiz-score" ref={scoreRef} />
      </div>
      <div className="quiz-body" ref={bodyRef} />
    </section>
  );
}
