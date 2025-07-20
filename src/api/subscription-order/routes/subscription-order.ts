/**
 * subscription-order router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/subscription-orders',
      handler: 'subscription-order.create',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
    {
      method: 'GET',
      path: '/subscription-orders/my',
      handler: 'subscription-order.findMy',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
    {
      method: 'POST',
      path: '/subscription-orders/:id/redeem',
      handler: 'subscription-order.redeemManual',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
  ],
};
