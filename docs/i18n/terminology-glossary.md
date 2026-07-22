# Ultimate Frisbee terminology glossary (EN ↔ AR)

The canonical wording for every sport term this app renders. Copy in
[`en.json`](../../src/shared/i18n/locales/en.json) and
[`ar.json`](../../src/shared/i18n/locales/ar.json) must use these terms — a term translated two
ways across two screens reads as two different concepts to a player.

Rule of thumb for Arabic: translate the **concept**, transliterate the **proper noun**. "Hammer"
becomes a description, "Ultimate" stays "ألتيميت" because that is what the community says.

## The sport

| English      | Arabic            | Note                                                                 |
| ------------ | ----------------- | -------------------------------------------------------------------- |
| Ultimate     | ألتيميت           | The sport. Never "الفريسبي النهائي".                                 |
| Frisbee/disc | القرص             | The object. `Frisbee` is a trademark; prefer "disc"/"القرص" in copy. |
| Pitch/field  | الملعب            |                                                                      |
| End zone     | منطقة التسجيل     |                                                                      |
| Pull         | الرمية الافتتاحية | The throw that starts a point.                                       |
| Point        | النقطة            | One scored point, not "match point".                                 |
| Game/match   | المباراة          |                                                                      |
| Half         | الشوط             |                                                                      |
| Timeout      | وقت مستقطع        |                                                                      |
| Cap          | الحد الزمني       | The time or score cap that ends a game.                              |

## Play

| English   | Arabic           | Note                              |
| --------- | ---------------- | --------------------------------- |
| Throw     | التمريرة         |                                   |
| Catch     | الاستلام         |                                   |
| Turnover  | فقدان الحيازة    | Possession lost, not a "mistake". |
| Block (D) | الصد             |                                   |
| Hold      | الاحتفاظ         | Scoring while on offence.         |
| Break     | الكسر            | Scoring while on defence.         |
| Offence   | الهجوم           |                                   |
| Defence   | الدفاع           |                                   |
| Handler   | الموزع           |                                   |
| Cutter    | القاطع           |                                   |
| Stack     | التشكيل          |                                   |
| Assist    | التمريرة الحاسمة |                                   |
| Goal      | الهدف            | The catch in the end zone.        |

## Squad and season

| English       | Arabic       | Note                                                  |
| ------------- | ------------ | ----------------------------------------------------- |
| Squad         | التشكيلة     | The selected group for a competition.                 |
| Roster        | القائمة      | The named match-day list.                             |
| Line          | الخط         | Offence/defence line assignment.                      |
| Jersey number | رقم القميص   | Always rendered in Latin digits.                      |
| Captain       | القائد       |                                                       |
| Coach         | المدرب       |                                                       |
| Tryout        | الاختبار     |                                                       |
| Practice      | التدريب      | A scheduled session.                                  |
| Attendance    | الحضور       |                                                       |
| Season        | الموسم       |                                                       |
| Competition   | البطولة      |                                                       |
| Fixture       | المواجهة     |                                                       |
| Leaderboard   | لوحة الصدارة |                                                       |
| Rank          | المركز       | Not "الترتيب", which reads as "sorting".              |
| Badge         | الوسام       |                                                       |
| Points        | النقاط       | Contribution points, distinct from a scored "النقطة". |

## Numbers, dates, and direction

- **Digits stay Latin.** CLDR resolves the bare `ar` locale to the `latn` numbering system, and
  `@/packages/number` formats through it. A score, a jersey number, and a rank must be readable by
  a bilingual squad on the sideline.
- **Instants render in Africa/Cairo** through `@/packages/date`; the API keeps UTC.
- **Score lines are bidi-isolated.** `formatScorePair` wraps `8 – 6` in U+2068/U+2069, because the
  Unicode algorithm otherwise resolves the dash right-to-left inside an Arabic paragraph and
  renders it as `6 – 8` — silently reversing the result of a match.
- **Percentages come from `Intl`**, never from `` `${value}%` ``: `Intl` places the sign on the
  locale's side and emits the bidi marks that keep it there.

## Related

[localization-workflow](localization-workflow.md) · [rules/21-i18n-rtl](../../rules/21-i18n-rtl.md)
