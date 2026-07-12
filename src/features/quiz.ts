// Quiz "Quem é esse Pokémon?" — silhueta + 4 opções, com placar.
import { fetchPokemon, MAX_POKEMON } from '../services/pokeapi';
import { getStaticImage } from '../services/sprites';
import { titleize } from '../domain/pokemonInfo';
import { t } from '../i18n';

interface QuizOptions {
  container: HTMLElement;
  scoreEl: HTMLElement;
  getNames: () => string[];
}

export interface QuizControls {
  refresh: () => void;
}

export function setupQuiz({ container, scoreEl, getNames }: QuizOptions): QuizControls {
  let score = 0;

  const showScore = (): void => {
    scoreEl.textContent = `${t('quizScore')}: ${score}`;
  };

  async function newRound(): Promise<void> {
    container.innerHTML = '<div class="skeleton"></div>';
    const id = Math.floor(Math.random() * MAX_POKEMON) + 1;
    const data = await fetchPokemon(id);
    if (!data) {
      void newRound();
      return;
    }

    container.innerHTML = '';

    const img = document.createElement('img');
    img.className = 'quiz-img is-silhouette';
    img.src = getStaticImage(data);
    img.alt = '?';
    container.appendChild(img);

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'quiz-next';
    next.textContent = t('quizNext');
    next.hidden = true;
    next.addEventListener('click', () => void newRound());

    // Monta 4 opções (a correta + 3 aleatórias).
    const names = getNames();
    const options = new Set<string>([data.name]);
    let guard = 0;
    while (options.size < 4 && names.length > 4 && guard < 60) {
      options.add(names[Math.floor(Math.random() * names.length)]);
      guard += 1;
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);

    const optionsEl = document.createElement('div');
    optionsEl.className = 'quiz-options';
    shuffled.forEach((name) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = titleize(name);
      btn.addEventListener('click', () => {
        img.classList.remove('is-silhouette');
        optionsEl.querySelectorAll('button').forEach((b) => (b.disabled = true));
        if (name === data.name) {
          btn.classList.add('is-correct');
          score += 1;
        } else {
          btn.classList.add('is-wrong');
          optionsEl.querySelectorAll('button').forEach((b) => {
            if (b.textContent === titleize(data.name)) b.classList.add('is-correct');
          });
        }
        showScore();
        next.hidden = false;
      });
      optionsEl.appendChild(btn);
    });

    container.append(optionsEl, next);
  }

  showScore();
  void newRound();

  return { refresh: showScore };
}
