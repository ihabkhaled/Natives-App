import { APP_ICONS } from '@/packages/icons';
import { IonIcon } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';
import { TEST_IDS } from '@/shared/config';

import type { TeamSwitcherProps } from './team-switcher.types';

/**
 * The scope switcher pinned above the signed-in identity in the shell.
 *
 * It renders nothing for a single-team principal: one team is not a choice,
 * and a disabled control in the rail is clutter rather than information. UI
 * only — the open state, the option list, and the cache invalidation that a
 * switch triggers all belong to `useTeamSwitcher`.
 */
export function TeamSwitcher(props: TeamSwitcherProps): React.JSX.Element | null {
  return props.isAvailable ? (
    <div className="app-team-switcher" data-testid={TEST_IDS.teamSwitcher}>
      <button
        type="button"
        data-testid={TEST_IDS.teamSwitcherToggle}
        className="app-team-switcher__toggle"
        aria-label={props.ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={props.isOpen}
        onClick={props.onToggle}
      >
        <IonIcon icon={APP_ICONS.people} aria-hidden="true" className="app-team-switcher__icon" />
        <span className="app-team-switcher__text">
          <span className="app-team-switcher__eyebrow">{props.label}</span>
          <span className="app-team-switcher__name">{props.activeTeamName}</span>
        </span>
        <IonIcon
          icon={APP_ICONS.chevronDown}
          aria-hidden="true"
          className="app-team-switcher__caret"
        />
      </button>
      <ul
        role="listbox"
        aria-label={props.ariaLabel}
        hidden={!props.isOpen}
        className="app-team-switcher__menu"
        data-testid={TEST_IDS.teamSwitcherMenu}
      >
        {props.options.map((option) => (
          <li key={option.teamId} role="none">
            <button
              type="button"
              role="option"
              aria-selected={option.isActive}
              data-testid={`${TEST_IDS.teamSwitcherOption}-${option.teamId}`}
              className={cx(
                'app-team-switcher__option',
                option.isActive ? 'app-team-switcher__option--active' : null,
              )}
              onClick={() => {
                props.onSelect(option.teamId);
              }}
            >
              <span className="app-team-switcher__option-name">{option.name}</span>
              {option.detail === null ? null : (
                <span className="app-team-switcher__option-detail">{option.detail}</span>
              )}
              <IonIcon
                icon={APP_ICONS.checkmark}
                aria-hidden="true"
                className="app-team-switcher__check"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
}
