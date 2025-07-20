/**
 * usdt-withdraw router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/usdt-withdraws',
      handler: 'usdt-withdraw.create',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
    {
      method: 'GET',
      path: '/usdt-withdraws/my',
      handler: 'usdt-withdraw.findMine',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
    {
      method: 'POST',
      path: '/usdt-withdraws/:id/confirm',
      handler: 'usdt-withdraw.confirm',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
  ],
};
