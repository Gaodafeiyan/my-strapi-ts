export default {
  kind: 'collectionType',
  collectionName: 'wallet_txes',
  info: {
    singularName: 'wallet-tx',
    pluralName: 'wallet-txes',
    displayName: 'Wallet Transaction',
    description: '钱包交易记录',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    txType: {
      type: 'enumeration',
      enum: ['deposit', 'usdt_withdraw', 'subscription_buy', 'subscription_redeem', 'referral_reward', 'lottery_prize', 'airdrop'],
      required: true,
    },
    direction: {
      type: 'enumeration',
      enum: ['in', 'out'],
      required: true,
    },
    amountUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    amountToken: {
      type: 'decimal',
      min: 0,
    },
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'wallet-txs',
    },
    relatedOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-order.subscription-order',
    },
    txHash: {
      type: 'string',
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'success', 'failed'],
      required: true,
      default: 'pending',
    },
    memo: {
      type: 'text',
    },
  },
}; 