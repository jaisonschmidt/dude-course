/**
 * Combina classes CSS de forma condicional (utility para Tailwind).
 * @param classes - Lista de classes, valores falsy são ignorados
 * @returns String com classes CSS combinadas
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
