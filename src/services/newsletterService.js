import api from './api';

export const newsletterService = {
  subscribe: (email) => {
    return api.post('/newsletter/subscribe', { email });
  },
  unsubscribe: (email) => {
    return api.post('/newsletter/unsubscribe', { email });
  },
  getSubscriptions: () => {
    return api.get('/newsletter/subscriptions');
  },
};

