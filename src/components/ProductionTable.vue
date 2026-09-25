<script setup>
import { computed } from 'vue';
import { usePlanStore } from '../stores/planStore';
import { useRecipeStore } from '../stores/recipeStore';

const planStore = usePlanStore();
const recipeStore = useRecipeStore();

const rows = computed(() => planStore.result?.nodes || []);
const totalPower = computed(() => planStore.result?.totalPower || 0);

const rawMaterialsText = computed(() => {
  const raw = planStore.result?.rawMaterials || {};
  return Object.keys(raw).map(id => `${recipeStore.getItemName(id)}: ${raw[id].toFixed(1)}/分钟`).join(' | ');
});
</script>

<template>
  <div class="table-container">
    <h3>产能规划结果</h3>
    <p class="summary">
      <strong>总电力消耗：</strong>{{ (totalPower / 1000).toFixed(2) }} MW
    </p>
    <p class="summary raw-summary">
      <strong>原材料总需求：</strong>{{ rawMaterialsText || '无' }}
    </p>

    <table>
      <thead>
        <tr>
          <th>物品</th>
          <th>产量/分钟</th>
          <th>建筑数量</th>
          <th>建筑类型</th>
          <th>电力 (kW)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.itemId + '-' + (row.recipeId || 'raw')" :class="{ 'raw-row': row.isRaw }">
          <td>{{ recipeStore.getItemName(row.itemId) }}</td>
          <td>{{ row.requiredPerMin.toFixed(1) }}</td>
          <td>{{ row.isRaw ? '—' : row.buildingCount }}</td>
          <td>{{ row.isRaw ? '原矿' : recipeStore.getBuildingName(row.buildingId) }}</td>
          <td>{{ row.isRaw ? '—' : row.power.toFixed(0) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container { margin-top: 20px; }
.summary { margin: 5px 0; color: #34495e; }
.raw-summary { color: #e67e22; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { padding: 8px 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
th { background-color: #f8f9fa; }
.raw-row { background-color: #fff8e1; color: #e67e22; }
</style>