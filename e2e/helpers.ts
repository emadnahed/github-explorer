import { device, element, by, waitFor } from 'detox';

/** Navigate to the profile of a given GitHub username from the Search screen. */
export async function searchAndOpenProfile(username: string): Promise<void> {
  await waitFor(element(by.id('search-input')))
    .toBeVisible()
    .withTimeout(10000);

  await element(by.id('search-input')).clearText();
  await element(by.id('search-input')).typeText(username);
  await element(by.id('search-input')).tapReturnKey();

  await waitFor(element(by.id('user-result-card')))
    .toBeVisible()
    .withTimeout(30000);
  await element(by.id('user-result-card')).tap();

  await waitFor(element(by.id('profile-scroll')))
    .toBeVisible()
    .withTimeout(10000);
}

/** Tap the Shortlists bottom-tab and wait for the screen container to appear. */
export async function goToShortlists(): Promise<void> {
  await waitFor(element(by.id('home-tab-shortlists')))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.id('home-tab-shortlists')).tap();
  await waitFor(element(by.id('shortlists-screen')))
    .toBeVisible()
    .withTimeout(8000);
}

/** Tap the Compare bottom-tab. */
export async function goToCompare(): Promise<void> {
  // 30s timeout: after profile navigation, image loads and reanimated animations can keep
  // Detox "busy" longer than a standard 10s window.
  await waitFor(element(by.id('home-tab-compare')))
    .toBeVisible()
    .withTimeout(30000);
  await element(by.id('home-tab-compare')).tap();
}

/** Tap the Explore bottom-tab and wait for the search input to be ready.
 *  If the ExploreStack lands on a nested screen (e.g. ProfileTabs), taps
 *  the tab a second time to pop back to the Search root. */
export async function goToExplore(): Promise<void> {
  await waitFor(element(by.id('home-tab-explore')))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.id('home-tab-explore')).tap();
  // After the first tap, check if we landed on Search (search-input visible).
  // If not, we're on ProfileTabs — tap again to pop the stack to root.
  try {
    await waitFor(element(by.id('search-input')))
      .toBeVisible()
      .withTimeout(1500);
  } catch {
    await element(by.id('home-tab-explore')).tap();
    await waitFor(element(by.id('search-input')))
      .toBeVisible()
      .withTimeout(8000);
  }
}
