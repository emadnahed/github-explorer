import { device, element, by, expect as detoxExpect, waitFor } from 'detox';
import { goToExplore, searchAndOpenProfile } from './helpers';

describe('Profile Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await searchAndOpenProfile('torvalds');
  });

  it('should display the profile scroll view', async () => {
    await detoxExpect(element(by.id('profile-scroll'))).toBeVisible();
  });

  it('should show the developer score card', async () => {
    await detoxExpect(element(by.id('developer-score-card'))).toBeVisible();
  });

  it('should allow typing and saving a recruiter note', async () => {
    // Scroll until the notes input is visible
    await waitFor(element(by.id('recruiter-notes-input')))
      .toBeVisible()
      .whileElement(by.id('profile-scroll'))
      .scroll(200, 'down');

    await element(by.id('recruiter-notes-input')).tap();
    await element(by.id('recruiter-notes-input')).clearText();
    await element(by.id('recruiter-notes-input')).typeText('Great kernel developer');

    // KeyboardAvoidingView (behavior="padding") shrinks the visible ScrollView height when
    // the keyboard is open, increasing the max scroll offset. Scroll with a normalized start
    // point (0.5, 0.5) so the gesture fires within the above-keyboard visible area, then
    // wait for the save button to appear.
    await element(by.id('profile-scroll')).scroll(250, 'down', 0.5, 0.5);
    await waitFor(element(by.id('recruiter-notes-save-btn')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('recruiter-notes-save-btn')).tap();

    await waitFor(element(by.text('Saved!')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should persist the recruiter note after navigating away and back', async () => {
    // Double-tap Explore: first tap switches to Explore tab, second pops ProfileTabs → Search
    await goToExplore();

    // Navigate back to the same profile
    await searchAndOpenProfile('torvalds');

    await waitFor(element(by.id('recruiter-notes-input')))
      .toBeVisible()
      .whileElement(by.id('profile-scroll'))
      .scroll(200, 'down');

    await detoxExpect(element(by.id('recruiter-notes-input'))).toHaveText(
      'Great kernel developer',
    );
  });
});
