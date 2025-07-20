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
      enum: ['deposit', 'withdraw', 'subscription', 'referral', 'aiToken'],
      required: true,
    },
    direction: {
      type: 'enumeration',
      enum: ['in', 'out'],
      required: true,
    },
    amount: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'success', 'failed'],
      required: true,
      default: 'pending',
    },
    meta: {
      type: 'json',
    },
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'wallet-txs',
    },
  },
}; 