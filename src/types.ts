/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chapter {
  id: string;
  title: string;
  content: string; // Dynamic Swahili story text
}

export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  rating: number; // e.g. 4.8
  price: number; // in TZS (0 for free)
  coverUrl: string;
  authorAvatar?: string;
  chapters: Chapter[];
  reads: number;
  likes?: number;
  isPremium: boolean;
  publishedDate: string;
  isFeatured?: boolean;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number; // Swahili wallet (TZS)
  purchasedStoryIds: string[];
  downloadedStoryIds: string[];
  profileImage?: string;
  hasRegistered?: boolean;
  isMwandishiRequested?: boolean;
  isMwandishiApproved?: boolean;
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  storyTitle: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  phone: string;
  date: string;
}

export type ActiveTab = 'home' | 'categories' | 'search' | 'downloads' | 'profile';
