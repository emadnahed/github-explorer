import { device, element, by, expect as detoxExpect, waitFor } from 'detox';
import { goToShortlists, goToExplore, searchAndOpenProfile } from './helpers';

const LIST_NAME = 'E2E Test List';

describe('Shortlists', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await goToShortlists();
  });

  it('should show the empty state when no shortlists exist', async () => {
    await detoxExpect(element(by.id('shortlist-empty-state'))).toBeVisible();
  });

  it('should create a new shortlist', async () => {
    await element(by.id('shortlist-name-input')).typeText(LIST_NAME);
    await element(by.id('shortlist-add-btn')).tap();

    await waitFor(element(by.id(`shortlist-card-${LIST_NAME}`)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should expand a shortlist to reveal the members list', async () => {
    // newInstance does NOT clear MMKV on iOS (file-based), so LIST_NAME from test 2
    // may already exist. Check first — only create it if absent. Creating a new shortlist
    // when the name already exists triggers a duplicate-name Alert that blocks all further
    // taps, and creating any new shortlist leaves keyboard/animation state that causes
    // goToShortlists() to time out in subsequent tests.
    let cardVisible = false;
    try {
      await waitFor(element(by.id(`shortlist-card-${LIST_NAME}`)))
        .toBeVisible()
        .withTimeout(1000);
      cardVisible = true;
    } catch {}

    if (!cardVisible) {
      await element(by.id('shortlist-name-input')).typeText(LIST_NAME);
      await element(by.id('shortlist-add-btn')).tap();
      await waitFor(element(by.id(`shortlist-card-${LIST_NAME}`)))
        .toBeVisible()
        .withTimeout(3000);
    }

    // handleCreate auto-expands the newly created card, so the members list is already visible.
    // Collapse it first to test the toggle, then expand.
    await element(by.id(`shortlist-card-${LIST_NAME}`)).tap(); // collapse
    await element(by.id(`shortlist-card-${LIST_NAME}`)).tap(); // expand

    await waitFor(element(by.id(`shortlist-members-${LIST_NAME}`)))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should add a developer to a shortlist from their profile', async () => {
    // Navigate to a user profile and tap the list icon in the header
    await goToExplore();
    await searchAndOpenProfile('torvalds');
    await element(by.id('profile-header-list-btn')).tap();

    // Shortlists screen opens in add-mode — tap our existing shortlist card to add the user
    await waitFor(element(by.id(`shortlist-card-${LIST_NAME}`)))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id(`shortlist-card-${LIST_NAME}`)).tap();

    // handleAddToShortlist dispatches addToShortlist, clears addUsername, calls goBack().
    // goBack() returns to Explore/ProfileTabs — wait for profile-scroll to confirm.
    // (If goBack() is a no-op for tab screens, we stay on Shortlists; the catch handles that.)
    try {
      await waitFor(element(by.id('profile-scroll')))
        .toBeVisible()
        .withTimeout(3000);
    } catch {
      // goBack() may not navigate for tab screens; we stay on Shortlists in normal mode.
    }

    // Go to Shortlists tab (or stay there) in normal mode
    await goToShortlists();

    // Expand the card — tap once to ensure expanded state (handles collapsed or expanded)
    // If already expanded: tap collapses, so we tap twice to guarantee expanded.
    await element(by.id(`shortlist-card-${LIST_NAME}`)).tap(); // toggle (collapse or expand)
    await element(by.id(`shortlist-card-${LIST_NAME}`)).tap(); // toggle again to ensure expanded

    await waitFor(element(by.id(`shortlist-members-${LIST_NAME}`)))
      .toBeVisible()
      .withTimeout(3000);

    // Verify '@torvalds' appears in the members list
    await detoxExpect(element(by.text('@torvalds'))).toBeVisible();
  });

  it('should delete a shortlist after confirmation', async () => {
    const deleteName = 'Delete Me';

    // Create a fresh shortlist to delete
    await goToShortlists();
    await element(by.id('shortlist-name-input')).typeText(deleteName);
    await element(by.id('shortlist-add-btn')).tap();
    await waitFor(element(by.id(`shortlist-card-${deleteName}`)))
      .toBeVisible()
      .withTimeout(3000);

    // Delete it
    await element(by.id(`shortlist-delete-btn-${deleteName}`)).tap();

    // Wait for the system alert to appear before tapping Confirm
    await waitFor(element(by.text('Delete')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.text('Delete')).tap(); // confirm system alert

    await waitFor(element(by.id(`shortlist-card-${deleteName}`)))
      .not.toBeVisible()
      .withTimeout(3000);
  });
});
