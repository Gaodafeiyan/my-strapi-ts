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
        policies: ['isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/usdt-withdraws/my',
      handler: 'usdt-withdraw.findMine',
      config: {
        policies: ['isAuthenticated']
      },
    },
    {
      method: 'POST',
      path: '/usdt-withdraws/:id/confirm',
      handler: 'usdt-withdraw.confirm',
      config: {
        policies: ['isAuthenticated']
      },
    },
  ],
};
