<template>
  <div class="active-extend-card" v-if="isVisible">
    <div class="active-extend-content">
      <div class="active-extend-header">
        <span class="gift-icon">🎁</span>
        <h3 class="active-extend-title">{{ $t('module.app_extend.active.title') }}</h3>
      </div>
      <div class="active-extend-body">
        <p class="active-extend-description">
          {{ $t('module.app_extend.active.desc') }}
        </p>
        <div class="active-extend-offer">
          <p class="offer-main">{{ $t('module.app_extend.active.offer_main') }}</p>
          <div class="price-container">
            <span class="current-price">{{ $t('module.app_extend.active.price_current') }}</span>
            <span class="original-price">{{ $t('module.app_extend.active.price_original') }}</span>
          </div>
        </div>
        <div class="active-extend-footer">
          <span class="deadline-warning">{{ $t('module.app_extend.active.deadline') }}</span>
          <button class="purchase-button" @click="openPay">{{ $t('module.app_extend.active.buy_now') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {Constant} from "@/global/Constant";

const isVisible = ref(false);

// 检查是否在销售期限内（2026年1月3日前）
const checkSaleDate = () => {
  const now = new Date();
  const saleEndDate = new Date('2026-01-03');
  // 如果当前日期早于截止日期，则显示组件
  isVisible.value = now < saleEndDate;
};

onMounted(() => {
  checkSaleDate();
});

const openPay = () => {
  window.open(Constant.mbd.active, '_blank')
}
</script>

<style scoped lang="less">
.active-extend-card {
  background: linear-gradient(135deg, #165DFF 0%, #71AEDD 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
  font-family: 'Arial', sans-serif;
  max-width: 400px;
  margin: 20px auto;
}

.active-extend-content {
  display: flex;
  flex-direction: column;
}

.active-extend-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.gift-icon {
  font-size: 24px;
  margin-right: 10px;
}

.active-extend-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.active-extend-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.active-extend-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.active-extend-offer {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.offer-main {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.price-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
}

.original-price {
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.8;
}

.active-extend-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.deadline-warning {
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  background: rgba(255, 215, 0, 0.2);
  padding: 8px;
  border-radius: 6px;
}

.purchase-button {
  background: #FFD700;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #FFC400;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>