import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Search Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the search input on launch', async () => {
    await detoxExpect(element(by.id('search-input'))).toBeVisible();
  });

  it('should find a valid GitHub user and show the result card', async () => {
    await element(by.id('search-input')).typeText('torvalds');
    await element(by.id('search-input')).tapReturnKey();

    await waitFor(element(by.id('user-result-card')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should show an error for a non-existent user', async () => {
    const bogusUser = 'this-user-xyz-definitely-does-not-exist-abc123';
    await element(by.id('search-input')).typeText(bogusUser);
    await element(by.id('search-input')).tapReturnKey();

    await waitFor(element(by.id('search-error-box')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should navigate to the profile screen when result card is tapped', async () => {
    await element(by.id('search-input')).typeText('torvalds');
    await element(by.id('search-input')).tapReturnKey();

    await waitFor(element(by.id('user-result-card')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('user-result-card')).tap();

    await waitFor(element(by.id('profile-scroll')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should add a recent-search chip after a successful search', async () => {
    await element(by.id('search-input')).typeText('torvalds');
    await element(by.id('search-input')).tapReturnKey();

    await waitFor(element(by.id('user-result-card')))
      .toBeVisible()
      .withTimeout(15000);

    // Reload so history chip appears without the result card in the way
    await device.reloadReactNative();

    await waitFor(element(by.id('history-chip-torvalds')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
