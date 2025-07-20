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
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'subscriptionOrders',
      required: true,
    },
    plan: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-plan.subscription-plan',
      required: true,
    },
    amountUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    productQuantity: {
      type: 'integer',
      required: true,
      min: 0,
    },
    durationDays: {
      type: 'integer',
      required: true,
      min: 1,
    },
    staticReturnRate: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    aiTokenRate: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    goldRushCount: {
      type: 'integer',
      required: true,
      min: 0,
    },
    expectedReturnUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    expectedAiTokenUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    startDate: {
      type: 'datetime',
      required: true,
    },
    endDate: {
      type: 'datetime',
      required: true,
    },
    status: {
      type: 'enumeration',
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      required: true,
    },
    isRedeemed: {
      type: 'boolean',
      default: false,
    },
    redeemedAt: {
      type: 'datetime',
    },
    redeemedAmountUSDT: {
      type: 'decimal',
      min: 0,
    },
    redeemedAiTokenUSDT: {
      type: 'decimal',
      min: 0,
    },
  },
}; 