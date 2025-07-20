// enums.ts
export const OrderState = ['draft','active','due','redeemed','cancelled'] as const;
export const TxType = ['deposit','usdt_withdraw','subscription_buy',
  'subscription_redeem','referral_reward','lottery_prize'] as const;
export const Direction = ['in','out'] as const;
export const WithdrawStatus = ['pending','success','rejected'] as const;
export const PlanCode = ['PLAN500','PLAN1K','PLAN2K','PLAN5K'] as const;

export type OrderStateType = typeof OrderState[number];
export type TxTypeType = typeof TxType[number];
export type DirectionType = typeof Direction[number];
export type WithdrawStatusType = typeof WithdrawStatus[number];
export type PlanCodeType = typeof PlanCode[number]; 