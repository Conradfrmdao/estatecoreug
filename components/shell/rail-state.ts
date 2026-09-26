/** Remembers whether the desktop menu is open, read on the server so the
    first paint already has the right width and nothing jumps. The menu opens
    expanded, with its labels showing, until someone chooses to collapse it. */
export const RAIL_COOKIE = 'ec-rail'

export const RAIL_WIDTH = {
  collapsed: 88,
  expanded: 248
} as const
