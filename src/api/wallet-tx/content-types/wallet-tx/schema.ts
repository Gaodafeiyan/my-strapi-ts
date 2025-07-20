export default {
  kind: 'collectionType',
  collectionName: 'wallet_txs',
  info: {
    singularName: 'wallet-tx',
    pluralName: 'wallet-txs',
    displayName: 'Wallet Transaction',
    description: '钱包交易记录',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'walletTxs',
      required: true,
    },
    type: {
      type: 'enumeration',
      enum: ['subscription', 'redemption', 'referral_reward', 'withdrawal', 'deposit'],
      required: true,
    },
    amountUSDT: {
      type: 'decimal',
      required: true,
    },
    aiTokenAmountUSDT: {
      type: 'decimal',
      default: 0,
      min: 0,
    },
    balanceBeforeUSDT: {
      type: 'decimal',
      required: true,
    },
    balanceAfterUSDT: {
      type: 'decimal',
      required: true,
    },
    aiTokenBalanceBeforeUSDT: {
      type: 'decimal',
      required: true,
    },
    aiTokenBalanceAfterUSDT: {
      type: 'decimal',
      required: true,
    },
    description: {
      type: 'text',
      required: true,
    },
    relatedOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-order.subscription-order',
    },
    relatedReferral: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::referral-reward.referral-reward',
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
      required: true,
    },
  },
}; 