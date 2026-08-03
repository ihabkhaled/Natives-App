import type { AboutScreenView } from '@/modules/home';

/** Deterministic About-screen view model shared by the container and component tests. */
export function buildAboutScreenView(overrides: Partial<AboutScreenView> = {}): AboutScreenView {
  return {
    path: '/about',
    seoTitle: 'About Us — Ultimate Natives',
    seoDescription: 'Ultimate Natives — an Ultimate Frisbee team in El Sheikh Zayed, Giza, Egypt.',
    heroEyebrow: 'Who we are',
    heroTitle: 'About Ultimate Natives',
    storyHeading: 'Our story',
    storyParagraphs: ['Founded in 2021.', 'Player-led since 2025.'],
    foundingQuote:
      'Founded in October 2021 by Captain Dalia Elgharib and Coach Youssef Aboutaleb. ' +
      'Ultimate Natives are a team of 25 committed and highly spirited players. We run ' +
      'natively as our programming systems and we play natively as our pharaonic ancestors.',
    factsHeading: 'Quick facts',
    facts: [
      { key: 'sport', label: 'Sport', value: 'Ultimate Frisbee' },
      { key: 'founded', label: 'Founded', value: 'October 2021' },
      { key: 'location', label: 'Location', value: 'El Sheikh Zayed, Giza, Egypt' },
      { key: 'roster', label: 'Roster', value: '25 players' },
    ],
    explainerHeading: 'What is Ultimate Frisbee?',
    explainerBody: 'Ultimate is a fast-paced, non-contact team sport played with a flying disc.',
    spiritHeading: 'Spirit of the Game',
    spiritIntro: 'Every player is responsible for fair play.',
    spiritValues: [
      { key: 'fairness', title: 'Self-officiated fairness', body: 'Players call their own fouls.' },
      { key: 'respect', title: 'Respect for opponents', body: 'We compete fiercely and fairly.' },
      { key: 'joy', title: 'Joy in the game', body: 'We play for the sport and the community.' },
      { key: 'effort', title: 'Consistent effort', body: 'We show up prepared every time.' },
    ],
    ...overrides,
  };
}
