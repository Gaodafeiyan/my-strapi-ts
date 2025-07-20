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
    plan: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-plan.subscription-plan',
      inversedBy: 'orders',
    },
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'subscriptionOrders',
    },
    state: {
      type: 'enumeration',
      enum: ['active', 'finished'],
      required: true,
      default: 'active',
    },
    principal: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    startAt: {
      type: 'datetime',
      required: true,
    },
    endAt: {
      type: 'datetime',
      required: true,
    },
    staticYieldAcc: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    aiTokenQty: {
      type: 'decimal',
      required: true,
      default: 0,
      min: 0,
    },
    spinQuota: {
      type: 'integer',
      required: true,
      default: 0,
      min: 0,
    },
    redeemedAt: {
      type: 'datetime',
    },
  },
}; 