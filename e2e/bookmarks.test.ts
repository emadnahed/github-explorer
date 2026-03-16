import { device, element, by, expect as detoxExpect, waitFor } from 'detox';
import { goToExplore, searchAndOpenProfile } from './helpers';

describe('Bookmarks', () => {
  beforeAll(async () => {
    // Fresh instance ensures MMKV state is clean (no pre-existing bookmarks)
    await device.launchApp({ newInstance: true });
  });

  it('should bookmark a developer from their profile header', async () => {
    await searchAndOpenProfile('torvalds');
    await element(by.id('profile-header-bookmark-btn')).tap();

    // Go back to Explore and reload to let the chip render from MMKV state
    await goToExplore();
    await device.reloadReactNative();

    await waitFor(element(by.id('bookmark-chip-torvalds')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should remove a bookmark when tapped again', async () => {
    // Setup: ensure the bookmark chip is visible before testing removal.
    // After test 1 it is already there; if this test runs in isolation it may not be,
    // so we add it first. Note: newInstance does NOT clear MMKV on iOS (file-based),
    // so we check chip presence rather than assuming a clean slate.
    await goToExplore();
    try {
      await waitFor(element(by.id('bookmark-chip-torvalds')))
        .toBeVisible()
        .withTimeout(1000);
    } catch {
      // Chip absent — bookmark torvalds first
      await searchAndOpenProfile('torvalds');
      await element(by.id('profile-header-bookmark-btn')).tap();
      await goToExplore();
      await device.reloadReactNative();
    }

    // Act: navigate back to profile and remove the bookmark
    await searchAndOpenProfile('torvalds');
    await element(by.id('profile-header-bookmark-btn')).tap();

    // Assert: chip is gone after reload
    await goToExplore();
    await device.reloadReactNative();
    await waitFor(element(by.id('bookmark-chip-torvalds')))
      .not.toBeVisible()
      .withTimeout(3000);
  });
});

describe('Search History', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should add a history chip after a successful search', async () => {
    await element(by.id('search-input')).typeText('torvalds');
    await element(by.id('search-input')).tapReturnKey();
    await waitFor(element(by.id('user-result-card'))).toBeVisible().withTimeout(15000);

    // Reload to clear result card; history is persisted via MMKV
    await device.reloadReactNative();

    await waitFor(element(by.id('history-chip-torvalds')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should load a profile when a history chip is tapped', async () => {
    // History still contains torvalds from the previous test
    await waitFor(element(by.id('history-chip-torvalds')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('history-chip-torvalds')).tap();

    await waitFor(element(by.id('profile-scroll')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should clear all search history', async () => {
    await goToExplore();
    // History chip should still be present
    await waitFor(element(by.id('history-chip-torvalds')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap the "Clear" button in the Recent Searches section header
    await element(by.id('history-clear-btn')).tap();

    await waitFor(element(by.id('history-chip-torvalds')))
      .not.toBeVisible()
      .withTimeout(3000);
  });
});
