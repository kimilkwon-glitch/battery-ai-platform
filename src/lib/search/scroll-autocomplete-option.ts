/** Keep keyboard-highlighted option inside the autocomplete list scrollport (not the page). */
export function scrollAutocompleteOptionIntoList(
  list: HTMLElement,
  option: HTMLElement,
  paddingPx = 2,
): void {
  const listRect = list.getBoundingClientRect();
  const rowRect = option.getBoundingClientRect();
  if (rowRect.top < listRect.top + paddingPx) {
    list.scrollTop -= listRect.top - rowRect.top + paddingPx;
  } else if (rowRect.bottom > listRect.bottom - paddingPx) {
    list.scrollTop += rowRect.bottom - listRect.bottom + paddingPx;
  }
}
