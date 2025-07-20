/**
 * referral-reward router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/referral-rewards/my',
      handler: 'referral-reward.findMy',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated']
      },
    },
  ],
};
