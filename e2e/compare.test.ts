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
    // torvalds is already in compareList from the previous test
    await goToExplore();
    await searchAndOpenProfile('gaearon');
    // Wait for repos to load (developer-score-card renders only after fetchRepos completes).
    // Without this, fetchRepos remains in-flight when goToCompare() runs, causing Detox to
    // wait for idle indefinitely and exceed the home-tab-compare visibility timeout.
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
