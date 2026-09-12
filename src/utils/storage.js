import {
  CURRENT_USER,
  mockMessages,
  mockOrders,
  mockPosts,
  mockReviews,
  mockTransactions,
} from '../data/mockData';

const STORAGE_KEYS = {
  version: 'campus-skill-version',
  posts: 'campus-skill-posts',
  orders: 'campus-skill-orders',
  reviews: 'campus-skill-reviews',
  user: 'campus-skill-user',
  transactions: 'campus-skill-transactions',
  messages: 'campus-skill-messages',
};

const APP_VERSION = 'v3-order-chat';

const safeRead = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const resetStorage = () => {
  safeWrite(STORAGE_KEYS.posts, mockPosts);
  safeWrite(STORAGE_KEYS.orders, mockOrders);
  safeWrite(STORAGE_KEYS.reviews, mockReviews);
  safeWrite(STORAGE_KEYS.transactions, mockTransactions);
  safeWrite(STORAGE_KEYS.messages, mockMessages);
  safeWrite(STORAGE_KEYS.user, CURRENT_USER);
  safeWrite(STORAGE_KEYS.version, APP_VERSION);
};

export const bootstrapStorage = () => {
  if (typeof window === 'undefined') return;

  const version = window.localStorage.getItem(STORAGE_KEYS.version);
  if (version !== APP_VERSION) {
    resetStorage();
    return;
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.posts)) {
    safeWrite(STORAGE_KEYS.posts, mockPosts);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.orders)) {
    safeWrite(STORAGE_KEYS.orders, mockOrders);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.reviews)) {
    safeWrite(STORAGE_KEYS.reviews, mockReviews);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.transactions)) {
    safeWrite(STORAGE_KEYS.transactions, mockTransactions);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.messages)) {
    safeWrite(STORAGE_KEYS.messages, mockMessages);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.user)) {
    safeWrite(STORAGE_KEYS.user, CURRENT_USER);
  }
};

export const getPosts = () => safeRead(STORAGE_KEYS.posts, mockPosts);
export const savePosts = (posts) => safeWrite(STORAGE_KEYS.posts, posts);

export const getOrders = () => safeRead(STORAGE_KEYS.orders, mockOrders);
export const saveOrders = (orders) => safeWrite(STORAGE_KEYS.orders, orders);

export const getReviews = () => safeRead(STORAGE_KEYS.reviews, mockReviews);
export const saveReviews = (reviews) => safeWrite(STORAGE_KEYS.reviews, reviews);

export const getTransactions = () => safeRead(STORAGE_KEYS.transactions, mockTransactions);
export const saveTransactions = (transactions) => safeWrite(STORAGE_KEYS.transactions, transactions);

export const getMessages = () => safeRead(STORAGE_KEYS.messages, mockMessages);
export const saveMessages = (messages) => safeWrite(STORAGE_KEYS.messages, messages);

export const getCurrentUser = () => safeRead(STORAGE_KEYS.user, CURRENT_USER);
