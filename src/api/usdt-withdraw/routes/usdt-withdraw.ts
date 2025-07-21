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
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/usdt-withdraws/my',
      handler: 'usdt-withdraw.findMine',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/usdt-withdraws',
      handler: 'usdt-withdraw.findAll',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'POST',
      path: '/usdt-withdraws/:id/confirm',
      handler: 'usdt-withdraw.confirm',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
  ],
};
