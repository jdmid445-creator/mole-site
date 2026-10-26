// Recent crossings, kept ONLY in this browser (localStorage) so people can get back to a crossing after closing the tab.
// Stores deposit addresses, amounts, chains and status. Never the destination wallet. "Forget" wipes it.
const KEY = 'parallax-recent';
const MAX = 8;
export const RECENT_EVENT = 'parallax-recent-change';

export function loadRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((x) => x && x.id && Array.isArray(x.deposits)) : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    /* private mode or storage blocked: the feature just stays empty */
  }
}

export function addRecent(entry) {
  const list = loadRecent().filter((x) => x.id !== entry.id);
  save([{ ...entry, at: entry.at || Date.now() }, ...list]);
}

export function updateRecentStatus(id, status) {
  const list = loadRecent();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0 || list[i].status === status) return;
  list[i] = { ...list[i], status };
  save(list);
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    /* nothing to clear */
  }
}
