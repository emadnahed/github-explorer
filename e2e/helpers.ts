import { device, element, by, waitFor } from 'detox';

/** Navigate to the profile of a given GitHub username from the Search screen. */
export async function searchAndOpenProfile(username: string): Promise<void> {
  await waitFor(element(by.id('search-input')))
    .toBeVisible()
    .withTimeout(10000);

  await element(by.id('search-input')).clearText();
  await element(by.id('search-input')).typeText(username);
  // Disable sync before tapReturnKey so that background work (e.g. CDN image
  // loads on first SearchScreen mount) does not block Detox from firing the action.
  await device.disableSynchronization();
  await element(by.id('search-input')).tapReturnKey();
  await device.enableSynchronization();

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
  // Disable sync for the entire navigation to Shortlists — NetworkIdlingResource
  // from the trending fetch blocks all waitFor calls on Android otherwise.
  await device.disableSynchronization();
  await waitFor(element(by.id('home-tab-shortlists')))
    .toBeVisible()
    .withTimeout(20000);
  await element(by.id('home-tab-shortlists')).tap();
  await waitFor(element(by.id('shortlists-screen')))
    .toBeVisible()
    .withTimeout(15000);
  await device.enableSynchronization();
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
