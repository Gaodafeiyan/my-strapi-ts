/**
 * lottery-spin router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/lottery-spins/spin',
      handler: 'lottery-spin.spin',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/lottery-spins/my',
      handler: 'lottery-spin.findMy',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
  ],
}; 