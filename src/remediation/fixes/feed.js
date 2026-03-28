/**
 * Post-render remediation for the Feed component.
 *
 * Fixes attempted:
 * - Add role="feed" to the .feed-container element
 * - Add role="article" to each .feed-post element
 * - Add aria-setsize and aria-posinset to each article for positional context
 * - Add aria-labelledby on each article pointing to the post author
 * - Make .post-action buttons accessible with role, tabindex, and keyboard
 * - Make .load-more accessible with role="button" and keyboard activation
 * - Add Page Down / Page Up key handling for feed navigation between articles
 *
 * Limitations discovered:
 * - aria-setsize should reflect total feed size; if more posts are loaded
 *   lazily, aria-setsize must be updated or set to -1 (unknown) — we use -1
 *   when a load-more button exists to signal an indeterminate total
 * - Page Down/Up navigation is applied to the feed container, but focus must
 *   already be within an article for the pattern to work as specified by ARIA
 * - Post action buttons (like, share) have text content but may be icon-only
 *   in some renders; fallback labels are generated from button text content
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy } from '../lib/aria.js';
import { makeClickable, onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateFeed(widget) {
  const container = widget.querySelector('.feed-container');
  const posts = queryAll('.feed-post', widget);
  const loadMore = widget.querySelector('.load-more');
  const hasMore = !!loadMore;
  const total = hasMore ? -1 : posts.length;

  if (container) {
    setRole(container, 'feed');
    ensureId(container, 'feed-container');
  }

  posts.forEach((post, i) => {
    setRole(post, 'article');
    ensureId(post, `feed-post-${i}`);
    setAria(post, 'posinset', String(i + 1));
    setAria(post, 'setsize', String(total));
    setTabIndex(post, 0);

    const author = post.querySelector('.post-author');
    if (author) {
      ensureId(author, `feed-author-${i}`);
      labelledBy(post, author);
    }

    const actions = queryAll('.post-action', post);
    actions.forEach((action, ai) => {
      const tag = action.tagName.toLowerCase();
      if (tag !== 'button') {
        setRole(action, 'button');
        setTabIndex(action, 0);
        makeClickable(action, `feed-action-${i}-${ai}`);
      }
      if (!action.getAttribute('aria-label') && action.textContent.trim()) {
        setAria(action, 'label', action.textContent.trim());
      }
    });
  });

  if (loadMore) {
    const tag = loadMore.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(loadMore, 'button');
      setTabIndex(loadMore, 0);
      makeClickable(loadMore, 'feed-load-more');
    }
  }

  // Page Down / Page Up navigation between articles
  if (container) {
    onKeyDown(container, 'feedPageNav', (e) => {
      const articles = queryAll('.feed-post', container);
      if (articles.length === 0) return;

      const current = document.activeElement;
      const currentArticle = current?.closest('.feed-post');
      const idx = currentArticle ? articles.indexOf(currentArticle) : -1;

      if (e.key === 'PageDown') {
        e.preventDefault();
        const next = Math.min(idx + 1, articles.length - 1);
        articles[next].focus();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        const prev = Math.max(idx - 1, 0);
        articles[prev].focus();
      }
    });
  }
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateFeed(widget);

    const stop = observeChanges(widget, () => {
      remediateFeed(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.feed-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
