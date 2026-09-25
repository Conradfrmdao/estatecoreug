/** Remembers whether the desktop menu is open, read on the server so the
    first paint already has the right width and nothing jumps. */
export const RAIL_COOKIE = 'ec-rail'

export const RAIL_WIDTH = {
  collapsed: 88,
  expanded: 248
} as const
