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
      inversedBy: 'wallet-balance',
    },
    usdtBalance: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    aiTokenBalance: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
  },
}; 