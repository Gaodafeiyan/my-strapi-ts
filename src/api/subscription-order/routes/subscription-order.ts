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
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/subscription-orders/my',
      handler: 'subscription-order.findMy',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'POST',
      path: '/subscription-orders/:id/redeem',
      handler: 'subscription-order.redeemManual',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
  ],
};
