/** Clerk's own screens - sign in, the profile modal, the account menu - in the app's colours. */
export const clerkVariables = {
  colorPrimary: '#0F1311',
  colorRing: '#179A55',
  fontFamily: 'var(--font-sans), system-ui, sans-serif',
  borderRadius: '0.875rem'
}

/** The sign-in and sign-up cards: Clerk's header is replaced by the page's own. */
export const authAppearance = {
  variables: clerkVariables,
  elements: {
    rootBox: 'w-full max-w-full',
    cardBox: 'w-full max-w-full rounded-[24px] border-0 shadow-soft',
    card: 'w-full max-w-full overflow-visible border-0 p-5 shadow-none sm:p-6',
    header: 'hidden',
    socialButtonsBlockButton: 'h-11 text-sm',
    dividerRow: 'my-2',
    formField: 'mb-2',
    formFieldLabel: 'mb-1 text-xs font-bold',
    formFieldInput: 'h-11 text-base sm:text-sm',
    formButtonPrimary: 'h-11 text-sm font-bold',
    footer: 'mt-0 text-xs'
  }
}
