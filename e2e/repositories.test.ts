import { device, element, by, expect as detoxExpect, waitFor } from 'detox';
import { searchAndOpenProfile } from './helpers';

describe('Repositories Tab', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await searchAndOpenProfile('torvalds');
    // Navigate to Repos via the top tab bar (testID unchanged)
    await element(by.id('profile-tab-repos')).tap();
    await waitFor(element(by.id('repos-list')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display the repositories list', async () => {
    await detoxExpect(element(by.id('repos-list'))).toBeVisible();
  });

  it('should sort repositories by Stars', async () => {
    await element(by.id('repo-sort-stars')).tap();
    await detoxExpect(element(by.id('repo-sort-stars'))).toBeVisible();
  });

  it('should sort repositories by Updated', async () => {
    await element(by.id('repo-sort-updated')).tap();
    await detoxExpect(element(by.id('repo-sort-updated'))).toBeVisible();
  });

  it('should sort repositories by Name (A-Z)', async () => {
    await element(by.id('repo-sort-name')).tap();
    await detoxExpect(element(by.id('repo-sort-name'))).toBeVisible();
  });
});

describe('Language Insights Tab', () => {
  beforeAll(async () => {
    // Independent launch so this describe block can run in isolation without relying
    // on the Repositories Tab describe's navigation state.
    await device.launchApp({ newInstance: true });
    await searchAndOpenProfile('torvalds');
    await element(by.id('profile-tab-languages')).tap();
  });

  it('should display the language insights scroll view', async () => {
    await waitFor(element(by.id('language-insights-scroll')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
