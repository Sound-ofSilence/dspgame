<script setup>
import { computed } from 'vue';
import { usePlanStore } from '../stores/planStore';
import { useRecipeStore } from '../stores/recipeStore';

const planStore = usePlanStore();
const recipeStore = useRecipeStore();

const rawMaterials = computed(() => {
  const raw = planStore.result?.rawMaterials || {};
  return Object.keys(raw).map(id => ({
    id,
    name: recipeStore.getItemName(id),
    amount: raw[id].toFixed(1),
  }));
});

const buildingRows = computed(() => {
  const nodes = planStore.result?.nodes || [];
  return nodes.filter(n => !n.isRaw).map(n => ({
    id: n.itemId,
    name: recipeStore.getItemName(n.itemId),
    amount: n.requiredPerMin.toFixed(1),
    buildingName: recipeStore.getBuildingName(n.buildingId),
    buildingCount: n.buildingCount,
    power: n.power.toFixed(0),
  }));
});

const totalPower = computed(() => planStore.result?.totalPower || 0);
const totalMachines = computed(() => planStore.result?.totalMachines || 0);
</script>

<template>
  <div class="table-container">
    <h3>产能规划结果</h3>
    
    <div class="summary-grid">
      <div class="summary-card">
        <span class="label">总电力消耗</span>
        <span class="value power">{{ (totalPower / 1000).toFixed(2) }} MW</span>
      </div>
      <div class="summary-card">
        <span class="label">总建筑数量</span>
        <span class="value machine">{{ totalMachines }} 台</span>
      </div>
    </div>

    <div class="section">
      <h4>📦 原材料需求 (每分钟)</h4>
      <el-table :data="rawMaterials" stripe style="width: 100%" size="small" :header-cell-style="{ background: '#f5f7fa' }">
        <el-table-column prop="name" label="原材料" />
        <el-table-column prop="amount" label="需求量 /分钟" align="right" />
      </el-table>
    </div>

    <div class="section">
      <h4>🏭 建筑/设备需求</h4>
      <el-table :data="buildingRows" stripe style="width: 100%" size="small" :header-cell-style="{ background: '#f5f7fa' }">
        <el-table-column prop="name" label="产物" />
        <el-table-column prop="amount" label="产量 /分钟" align="right" />
        <el-table-column prop="buildingName" label="建筑类型" />
        <el-table-column prop="buildingCount" label="数量" align="center">
          <template #default="scope">
            <strong style="color: #67c23a;">{{ scope.row.buildingCount }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="power" label="电力 (kW)" align="right" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.table-container { margin-top: 0; }
h3 { margin-top: 0; color: #303133; border-bottom: 1px solid #ebeef5; padding-bottom: 12px; font-size: 16px; }
h4 { margin: 20px 0 10px; color: #606266; font-size: 14px; }

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e4e7ed;
}

.summary-card .label { font-size: 12px; color: #909399; }
.summary-card .value { font-size: 18px; font-weight: bold; margin-top: 4px; }
.value.power { color: #e6a23c; }
.value.machine { color: #67c23a; }

.section { margin-top: 16px; }
</style>