<script setup>
import { ref, computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';
import { usePlanStore } from '../stores/planStore';
import CatalogGraph from './CatalogGraph.vue';

const recipeStore = useRecipeStore();
const planStore = usePlanStore();
const keyword = ref('');

const filteredRecipes = computed(() => {
  const list = recipeStore.recipes;
  if (!keyword.value) return list;
  const lower = keyword.value.toLowerCase();
  return list.filter(r => r.Name.toLowerCase().includes(lower));
});
</script>

<template>
  <div class="catalog-container">
    <el-card shadow="never" class="filter-card">
      <div class="filter-header">
        <span>全局物品图鉴</span>
        <div class="filter-actions">
          <el-radio-group v-model="planStore.catalogViewMode" size="small">
            <el-radio-button value="graph">网状关系图</el-radio-button>
            <el-radio-button value="table">数据表格</el-radio-button>
          </el-radio-group>
          <el-input v-model="keyword" placeholder="搜索配方或物品..." style="width: 200px;" clearable />
        </div>
      </div>
    </el-card>
    
    <!-- 网状图视图 -->
    <div v-show="planStore.catalogViewMode === 'graph'" class="view-panel">
      <CatalogGraph />
    </div>

    <!-- 表格视图 -->
    <div v-show="planStore.catalogViewMode === 'table'" class="view-panel">
      <el-table :data="filteredRecipes" stripe style="width: 100%; margin-top: 16px;" height="70vh" :header-cell-style="{ background: '#f5f7fa' }">
        <el-table-column prop="Name" label="产物名称" width="180" />
        <el-table-column label="配方要求" min-width="300">
          <template #default="scope">
            <span v-for="(itemId, idx) in scope.row.Items" :key="idx" class="recipe-item">
              {{ recipeStore.getItemName(itemId) }} × {{ scope.row.ItemCounts[idx] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="生产建筑" width="200">
          <template #default="scope">
            <span v-for="bId in scope.row.Factories" :key="bId" class="building-tag">
              {{ recipeStore.getBuildingName(bId) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="TimeSpend" label="耗时 (秒)" width="120">
          <template #default="scope">{{ (scope.row.TimeSpend / 60).toFixed(1) }} s</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.catalog-container { padding: 10px; }
.filter-card { margin-bottom: 16px; }
.filter-header { display: flex; justify-content: space-between; align-items: center; }
.filter-actions { display: flex; gap: 10px; align-items: center; }
.recipe-item { display: inline-block; background: #f0f2f5; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-size: 12px; font-family: monospace; }
.building-tag { display: inline-block; background: #ecf5ff; color: #409eff; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-size: 12px; }
</style>