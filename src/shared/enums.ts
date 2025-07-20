// enums.ts
export const TxType = {
  DEPOSIT: 'deposit',
  USDT_WITHDRAW: 'usdt_withdraw',
  SUBSCRIPTION_BUY: 'subscription_buy',
  SUBSCRIPTION_REDEEM: 'subscription_redeem',
  REFERRAL_REWARD: 'referral_reward',
  LOTTERY_PRIZE: 'lottery_prize',
  ADMIN_RECHARGE: 'admin_recharge',
} as const;

export const Direction = {
  IN: 'in',
  OUT: 'out',
} as const;

export const OrderState = {
  ACTIVE: 'active',
  REDEEMED: 'redeemed',
  CANCELLED: 'cancelled',
} as const;

export const PlanCode = {
  PLAN500: 'PLAN500',
  PLAN1K: 'PLAN1K',
  PLAN2K: 'PLAN2K',
  PLAN5K: 'PLAN5K',
} as const;

export type TxTypeType = typeof TxType[keyof typeof TxType];
export type DirectionType = typeof Direction[keyof typeof Direction];
export type OrderStateType = typeof OrderState[keyof typeof OrderState];
export type PlanCodeType = typeof PlanCode[keyof typeof PlanCode]; 