import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalValue {
  open: (content: ReactNode) => void;
  close: () => void;
}

const ModalContext = createContext<ModalValue | null>(null);

// Provider de modal genérico: qualquer componente chama open(<Conteúdo/>).
// Cuida do overlay, botão fechar, Escape, clique no backdrop e devolve o foco
// ao elemento que abriu o modal (acessibilidade).
export function ModalProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const open = useCallback((node: ReactNode) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setContent(node);
  }, []);
  const close = useCallback(() => {
    setContent(null);
    lastFocused.current?.focus();
  }, []);

  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [content, close]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {content && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="modal__box">
            <button className="modal__close" type="button" aria-label="Fechar" onClick={close}>
              ✕
            </button>
            {content}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal deve ser usado dentro de ModalProvider');
  return ctx;
}
