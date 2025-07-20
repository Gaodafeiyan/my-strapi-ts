/**
 * wallet-balance service
 */

import Decimal from 'decimal.js';
import { TxType, Direction, TxTypeType, DirectionType } from '../../../../shared/enums';

interface TxMeta {
  type: TxTypeType;
  direction: DirectionType;
  amount: Decimal;
  orderId?: number;
  withdrawId?: number;
  referralId?: number;
  description?: string;
}

export async function addUSDT(userId: number, amt: Decimal, meta: Partial<TxMeta>) {
  // 读取当前余额
  const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
    filters: { user: userId } as any,
    populate: ['user']
  });

  if (!wallet || wallet.length === 0) {
    throw new Error('Wallet not found');
  }

  const currentWallet = wallet[0];
  const newBalance = new Decimal(currentWallet.usdtBalance).plus(amt);

  // 更新钱包余额
  await strapi.entityService.update('api::wallet-balance.wallet-balance', currentWallet.id, {
    data: { usdtBalance: newBalance.toNumber() }
  });

  // 创建交易记录
  await strapi.entityService.create('api::wallet-tx.wallet-tx', {
    data: {
      user: userId,
      tx_type: meta.type || 'deposit',
      direction: meta.direction || 'in',
      amountUSDT: amt.toNumber(),
      Wallet_status: 'success',
      memo: meta.description,
    } as any
  });

  return newBalance;
}

export async function addToken(userId: number, amt: Decimal, meta: Partial<TxMeta>) {
  // 读取当前余额
  const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
    filters: { user: userId } as any,
    populate: ['user']
  });

  if (!wallet || wallet.length === 0) {
    throw new Error('Wallet not found');
  }

  const currentWallet = wallet[0];
  const newBalance = new Decimal(currentWallet.aiTokenBalance).plus(amt);

  // 更新钱包余额
  await strapi.entityService.update('api::wallet-balance.wallet-balance', currentWallet.id, {
    data: { aiTokenBalance: newBalance.toNumber() }
  });

  // 创建交易记录
  await strapi.entityService.create('api::wallet-tx.wallet-tx', {
    data: {
      user: userId,
      tx_type: meta.type || 'deposit',
      direction: meta.direction || 'in',
      amountToken: amt.toNumber(),
      Wallet_status: 'success',
      memo: meta.description,
    } as any
  });

  return newBalance;
}

export async function getWalletBalance(userId: number) {
  const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
    filters: { user: userId } as any,
    populate: ['user']
  });

  if (!wallet || wallet.length === 0) {
    return { usdtBalance: 0, aiTokenBalance: 0 };
  }

  return wallet[0];
}
