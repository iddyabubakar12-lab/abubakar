/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story } from '../types';

export const INITIAL_STORIES: Story[] = [];

export function loadStoriesFromStorage(): Story[] {
  if (typeof window === 'undefined') return INITIAL_STORIES;
  const stored = localStorage.getItem('simulizi_stories_v1');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored stories', e);
      return INITIAL_STORIES;
    }
  }
  return INITIAL_STORIES;
}

export function saveStoriesToStorage(stories: Story[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('simulizi_stories_v1', JSON.stringify(stories));
  }
}
