export default {
  kind: 'collectionType',
  collectionName: 'usdt_withdraws',
  info: {
    singularName: 'usdt-withdraw',
    pluralName: 'usdt-withdraws',
    displayName: 'USDT Withdraw',
    description: 'USDT 提现记录',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    amount: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    toAddress: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'success', 'failed'],
      required: true,
      default: 'pending',
    },
    txHash: {
      type: 'string',
    },
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'usdt-withdraws',
    },
  },
}; 