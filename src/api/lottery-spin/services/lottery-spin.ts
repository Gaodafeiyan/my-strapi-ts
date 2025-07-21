/**
 * lottery-spin service
 */

import { addUSDT } from '../../wallet-balance/services/wallet-balance';

export async function spinLottery(userId: number) {
  // 获取抽奖配置
  const config = await strapi.entityService.findMany('api::lottery-config.lottery-config', {
    filters: { enabled: true } as any,
  });

  if (!config || config.length === 0) {
    throw new Error('Lottery not available');
  }

  const lotteryConfig = config[0];
  const costUSDT = lotteryConfig.costUSDT;
  const winRate = lotteryConfig.winRate || 30.0; // 默认30%中奖率

  // 检查用户余额
  const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
    filters: { user: userId } as any,
  });

  if (!wallet || wallet.length === 0) {
    throw new Error('Wallet not found');
  }

  const userWallet = wallet[0];
  if (userWallet.usdtBalance < costUSDT) {
    throw new Error('Insufficient balance');
  }

  // 扣除抽奖费用
  await addUSDT(userId, -costUSDT, {
    type: 'lottery_prize',
    direction: 'out',
    amount: costUSDT,
    description: `Lottery spin cost`,
  });

  // 获取奖品列表
  const prizes = await strapi.entityService.findMany('api::lottery-prize.lottery-prize', {
    filters: { enabled: true } as any,
  });

  if (!prizes || prizes.length === 0) {
    throw new Error('No prizes available');
  }

  // 机率控制：首先决定是否中奖
  const randomWin = Math.random() * 100;
  const isWin = randomWin <= winRate;

  let selectedPrize = null;
  let result = 'lose';

  if (isWin) {
    // 中奖：从有奖品的列表中随机选择
    const winningPrizes = prizes.filter(prize => prize.amountUSDT > 0);
    
    if (winningPrizes.length > 0) {
      // 基于权重选择奖品
      const totalWeight = winningPrizes.reduce((sum, prize) => sum + prize.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const prize of winningPrizes) {
        random -= prize.weight;
        if (random <= 0) {
          selectedPrize = prize;
          break;
        }
      }
      
      if (!selectedPrize) {
        selectedPrize = winningPrizes[0];
      }
      
      result = 'win';
      
      // 发放奖励
      await addUSDT(userId, selectedPrize.amountUSDT, {
        type: 'lottery_prize',
        direction: 'in',
        amount: selectedPrize.amountUSDT,
        description: `Lottery prize: ${selectedPrize.name}`,
      });
    } else {
      // 没有奖品，选择空奖
      const emptyPrizes = prizes.filter(prize => prize.amountUSDT === 0);
      if (emptyPrizes.length > 0) {
        selectedPrize = emptyPrizes[Math.floor(Math.random() * emptyPrizes.length)];
      } else {
        selectedPrize = prizes[0];
      }
    }
  } else {
    // 未中奖：从空奖或低价值奖品中选择
    const losingPrizes = prizes.filter(prize => prize.amountUSDT === 0);
    
    if (losingPrizes.length > 0) {
      selectedPrize = losingPrizes[Math.floor(Math.random() * losingPrizes.length)];
    } else {
      // 如果没有空奖，选择价值最低的奖品
      selectedPrize = prizes.reduce((min, prize) => 
        prize.amountUSDT < min.amountUSDT ? prize : min
      );
    }
  }

  // 创建抽奖记录
  const spinRecord = await strapi.entityService.create('api::lottery-spin.lottery-spin', {
    data: {
      user: userId,
      prize: selectedPrize.id,
      amountUSDT: selectedPrize.amountUSDT,
      costUSDT: costUSDT,
      result: result,
      description: isWin ? `Won ${selectedPrize.name}` : 'No prize',
    } as any,
  });

  return {
    ...spinRecord,
    prize: selectedPrize,
    isWin: isWin,
    winRate: winRate,
    actualWinRate: randomWin,
  };
} 