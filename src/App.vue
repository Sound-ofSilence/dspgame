<script setup>
import { onMounted, computed, watch } from 'vue';
import { usePlanStore } from './stores/planStore';
import { useRecipeStore } from './stores/recipeStore';
import RecipeTreeNode from './components/RecipeTreeNode.vue';
import ProductionTable from './components/ProductionTable.vue';
import ItemSelector from './components/ItemSelector.vue';
import { buildPathTree } from './engine/pathFinder';

const planStore = usePlanStore();
const recipeStore = useRecipeStore();

// 监听目标物品和产量的变化，自动计算
watch(
  [() => planStore.targetItemId, () => planStore.targetPerMin],
  () => {
    planStore.calculate();
  }
);

onMounted(() => {
  planStore.calculate(); // 初始化时计算一次
});

// 构建可视化树
const pathTree = computed(() => {
  if (!planStore.targetItemId) return null;
  return buildPathTree(
    planStore.targetItemId,
    recipeStore.recipesById,
    recipeStore.recipesByResult,
    { selectedRecipes: planStore.selectedRecipes }
  );
});
</script>

<template>
  <div class="app-container">
    <header>
      <h1>🌌 戴森球计划 - 产能规划工具</h1>
      <p>输入目标产量，自动计算合成路径、建筑数量与原材料需求。</p>
    </header>

    <section class="controls">
      <div class="control-item">
        <span class="label">选择目标物品：</span>
        <ItemSelector v-model="planStore.targetItemId" />
      </div>

      <div class="control-item">
        <span class="label">目标产量（每分钟）：</span>
        <el-input-number v-model="planStore.targetPerMin" :min="1" :step="10" />
      </div>
    </section>

    <div class="results">
      <section class="panel path-tree">
        <h3>合成路径树</h3>
        <RecipeTreeNode v-if="pathTree" :node="pathTree" :depth="0" />
        <el-empty v-else description="请先选择目标物品" />
      </section>

      <section class="panel">
        <ProductionTable />
      </section>
    </div>
  </div>
</template>

<style scoped>
.app-container { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
header { text-align: center; margin-bottom: 30px; }
header h1 { color: #2c3e50; margin-bottom: 5px; }
header p { color: #7f8c8d; margin-top: 5px; }

.controls { display: flex; gap: 30px; align-items: center; background: #f8f9fa; padding: 20px 30px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
.control-item { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #34495e; }

.results { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
@media (max-width: 900px) { .results { grid-template-columns: 1fr; } }
.panel { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
.panel h3 { margin-top: 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 12px; }
</style>