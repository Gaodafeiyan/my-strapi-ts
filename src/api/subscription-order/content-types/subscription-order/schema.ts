export default {
  kind: 'collectionType',
  collectionName: 'subscription_orders',
  info: {
    singularName: 'subscription-order',
    pluralName: 'subscription-orders',
    displayName: 'Subscription Order',
    description: '认购订单',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    orderNo: {
      type: 'uid',
      required: true,
      unique: true,
      minLength: 12,
      maxLength: 12,
    },
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'subscription-orders',
    },
    plan: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-plan.subscription-plan',
      inversedBy: 'orders',
    },
    principalUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    staticYieldUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    tokenBonusAmount: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    cycleDays: {
      type: 'integer',
      required: true,
      min: 1,
    },
    buyTxHash: {
      type: 'string',
    },
    redeemTxHash: {
      type: 'string',
    },
    startAt: {
      type: 'datetime',
      required: true,
    },
    endAt: {
      type: 'datetime',
      required: true,
    },
    state: {
      type: 'enumeration',
      enum: ['draft', 'active', 'due', 'redeemed', 'cancelled'],
      required: true,
      default: 'draft',
    },
    spinQuotaGranted: {
      type: 'boolean',
      required: true,
      default: false,
    },
  },
}; 