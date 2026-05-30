import type { KeyboardEvent } from 'react';

export function activateWithKeyboard(event: KeyboardEvent<SVGGElement | SVGPathElement>, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}
