export default {
  kind: 'collectionType',
  collectionName: 'wallet_balances',
  info: {
    singularName: 'wallet-balance',
    pluralName: 'wallet-balances',
    displayName: 'Wallet Balance',
    description: '用户钱包余额',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
      mappedBy: 'walletBalance',
      required: true,
    },
    balanceUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    aiTokenBalanceUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    totalEarningsUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    todayEarningsUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    totalInviteEarningsUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    totalStaticEarningsUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    activeOrdersCount: {
      type: 'integer',
      required: true,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: 'datetime',
      required: true,
    },
  },
}; 