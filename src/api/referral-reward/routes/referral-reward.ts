/**
 * referral-reward router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/referral-rewards/my',
      handler: 'referral-reward.findMine',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
  ],
};
