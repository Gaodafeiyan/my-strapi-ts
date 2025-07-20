/**
 * wallet-balance router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/wallet-balances/my',
      handler: 'wallet-balance.findMine',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
    {
      method: 'GET',
      path: '/wallet-balances/deposit-address',
      handler: 'wallet-balance.getAddr',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
    {
      method: 'POST',
      path: '/wallet-balances/admin-recharge',
      handler: 'wallet-balance.adminRecharge',
      config: {
        auth: {
          scope: ['authenticated']
        }
      },
    },
  ],
};
