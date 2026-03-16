import { device, element, by, expect as detoxExpect, waitFor } from 'detox';
import { goToCompare, goToExplore, searchAndOpenProfile } from './helpers';

describe('Compare Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should show the empty state when no developers are selected', async () => {
    await goToCompare();
    await waitFor(element(by.id('compare-empty-state')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show a hint after adding one developer to compare', async () => {
    await goToExplore();
    await searchAndOpenProfile('torvalds');
    await element(by.id('profile-header-compare-btn')).tap();

    await goToCompare();
    await waitFor(element(by.id('compare-empty-state')))
      .toBeVisible()
      .withTimeout(5000);
    await detoxExpect(
      element(by.text("You've added @torvalds — add one more developer to compare.")),
    ).toBeVisible();
  });

  it('should display side-by-side comparison when 2 developers are selected', async () => {
    // Ensure torvalds is in compareList without reloading the React Native bundle.
    // reloadReactNative() causes a full app re-render that keeps Detox busy far longer
    // than goToCompare()'s synchronisation window. Instead, check the current state:
    // if the hint for torvalds is visible (test 2 already added him), reuse it;
    // otherwise add him here so this test can also run in isolation.
    try {
      await goToCompare();
      await waitFor(
        element(by.text("You've added @torvalds — add one more developer to compare.")),
      )
        .toBeVisible()
        .withTimeout(2000);
      // torvalds confirmed in compareList — go back to Explore to add gaearon
      await goToExplore();
    } catch {
      // compareList is empty — add torvalds first
      await goToExplore();
      await searchAndOpenProfile('torvalds');
      await waitFor(element(by.id('developer-score-card')))
        .toBeVisible()
        .withTimeout(30000);
      await element(by.id('profile-header-compare-btn')).tap();
      await goToExplore();
    }

    // Add gaearon (wait for score card to ensure fetchRepos is idle before goToCompare)
    await searchAndOpenProfile('gaearon');
    await waitFor(element(by.id('developer-score-card')))
      .toBeVisible()
      .withTimeout(30000);
    await element(by.id('profile-header-compare-btn')).tap();

    await goToCompare();
    await waitFor(element(by.id('compare-scroll')))
      .toBeVisible()
      .withTimeout(20000);
  });

  it('should clear the compare list', async () => {
    // compare-scroll is already visible; clear button should be present
    await waitFor(element(by.id('compare-clear-btn')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('compare-clear-btn')).tap();

    await waitFor(element(by.id('compare-empty-state')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
