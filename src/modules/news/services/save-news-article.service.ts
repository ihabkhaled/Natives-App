import { NEWS_SOURCE_STATUS } from '../news.constants';
import type { NewsWriteCommand, NewsWriteResult } from '../types/news.types';

/**
 * TODO(news-endpoints, contract 1.8.0): `POST /news` / `PUT /news/{id}`
 * (authenticated, `news.manage`) do not exist yet. The stub takes the exact
 * command the real endpoints will accept, makes NO network call, and reports
 * `unavailable` — the editor tells the author plainly that nothing was sent
 * rather than showing a success it cannot back up.
 *
 * Domain rule this signature already encodes: a PUBLISHED story is immutable,
 * so a save against one creates a NEW REVISION rather than mutating what
 * readers currently see. `articleId` is the story being revised (null for a
 * brand-new draft); the editor states that consequence before the author
 * saves, so revision-on-save is never a silent surprise.
 *
 * Wiring it up is a one-file change: replace the body with a gateway
 * `requestSaveNewsArticle(command)` call mapped through `mapNewsArticle`.
 */
export function saveNewsArticle(command: NewsWriteCommand): Promise<NewsWriteResult> {
  void command;
  return Promise.resolve({ status: NEWS_SOURCE_STATUS.Unavailable, article: null });
}
