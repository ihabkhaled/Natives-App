import { describe, expect, it } from 'vitest';

import { buildSquad } from '../../../../tests/factories/competitions.factory';
import {
  availableTransitions,
  buildSquadCard,
  buildSquadFacts,
  buildSquadHeadline,
  isSelectionFrozen,
  transitionLabel,
} from './squad-view.helper';

const LOCALE = 'en';

const t = (key: string): string => key;
const instant = (iso: string): string => `cairo:${iso}`;

describe('buildSquadCard', () => {
  it('summarises status, revision, threshold, and deadline', () => {
    const card = buildSquadCard(t, LOCALE, instant, buildSquad());

    expect(card).toMatchObject({
      id: 'squad-1',
      statusLabel: 'squads.statusDraft',
      statusTone: 'medium',
      revisionLabel: 'squads.revisionValue',
      thresholdLabel: 'squads.thresholdValue',
      deadlineLabel: 'cairo:2026-09-02T18:00:00.000Z',
    });
  });

  it('says there is no deadline rather than rendering an empty date', () => {
    const card = buildSquadCard(t, LOCALE, instant, buildSquad({ selectionDeadline: null }));

    expect(card.deadlineLabel).toBe('squads.deadlineNone');
  });
});

describe('buildSquadFacts', () => {
  it('names the competition when the squad belongs to one', () => {
    const facts = buildSquadFacts(t, LOCALE, instant, buildSquad());

    expect(facts[0]).toEqual({
      key: 'competition',
      label: 'squads.competitionLabel',
      value: 'comp-1',
    });
  });

  it('marks a season squad with no competition', () => {
    const facts = buildSquadFacts(
      t,
      LOCALE,
      instant,
      buildSquad({ competitionId: null, selectionDeadline: null }),
    );

    expect(facts[0]?.value).toBe('squads.competitionNone');
    expect(facts[4]?.value).toBe('squads.deadlineNone');
  });
});

describe('availableTransitions', () => {
  it('offers publish and archive from draft', () => {
    expect(availableTransitions('draft', true)).toEqual(['publish', 'archive']);
  });

  it('offers lock, revise, and archive once published', () => {
    expect(availableTransitions('published', true)).toEqual(['lock', 'revise', 'archive']);
  });

  it('only allows a revision or archive once locked', () => {
    expect(availableTransitions('locked', true)).toEqual(['revise', 'archive']);
  });

  it('offers nothing for an archived squad', () => {
    expect(availableTransitions('archived', true)).toEqual([]);
  });

  it('offers nothing at all without the manage grant', () => {
    expect(availableTransitions('draft', false)).toEqual([]);
  });
});

describe('transitionLabel and isSelectionFrozen', () => {
  it('translates each lifecycle action', () => {
    expect(transitionLabel(t, 'publish')).toBe('squads.transitionPublish');
  });

  it('freezes selection once the squad is locked or archived', () => {
    expect(isSelectionFrozen('locked')).toBe(true);
    expect(isSelectionFrozen('archived')).toBe(true);
    expect(isSelectionFrozen('draft')).toBe(false);
    expect(isSelectionFrozen('published')).toBe(false);
  });
});

describe('buildSquadHeadline', () => {
  it('degrades to a titled, tone-neutral header while the record is absent', () => {
    expect(buildSquadHeadline(t, LOCALE, instant, null)).toEqual({
      heading: 'squads.detailTitle',
      statusLabel: '',
      statusTone: 'medium',
      notes: null,
      facts: [],
    });
  });

  it('carries the coach notes when the squad has them', () => {
    const headline = buildSquadHeadline(
      t,
      LOCALE,
      instant,
      buildSquad({ status: 'locked', notes: 'Two handlers travel.' }),
    );

    expect(headline.notes).toBe('Two handlers travel.');
    expect(headline.statusTone).toBe('warning');
  });
});
