<script setup>
import { onMounted } from 'vue';
import { usePlanStore } from './stores/planStore';
import { useRecipeStore } from './stores/recipeStore';
import RecipeTreeNode from './components/RecipeTreeNode.vue';
import ProductionTable from './components/ProductionTable.vue';

const planStore = usePlanStore();
const recipeStore = useRecipeStore();

onMounted(() => {
  // 默认选中电路板，方便你直接看到效果
  planStore.targetItemId = 1106;
  planStore.calculate();
});

// 构建可视化树的辅助函数
import { buildPathTree } from './engine/pathFinder';
import { computed } from 'vue';

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
      <label>
        选择目标物品：
        <select v-model="planStore.targetItemId">
          <option v-for="(item, id) in recipeStore.items" :key="id" :value="Number(id)">
            {{ item.Name }}
          </option>
        </select>
      </label>

      <label>
        目标产量（每分钟）：
        <input type="number" v-model.number="planStore.targetPerMin" min="1" />
      </label>

      <button @click="planStore.calculate()">开始计算</button>
    </section>

    <div class="results">
      <section class="path-tree">
        <h3>合成路径树</h3>
        <RecipeTreeNode v-if="pathTree" :node="pathTree" :depth="0" />
      </section>

      <ProductionTable />
    </div>
  </div>
</template>

<style scoped>
.app-container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
header { text-align: center; margin-bottom: 30px; }
header h1 { color: #2c3e50; margin-bottom: 5px; }
header p { color: #7f8c8d; }

.controls { display: flex; gap: 20px; align-items: flex-end; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.controls label { display: flex; flex-direction: column; font-weight: bold; font-size: 14px; color: #34495e; }
.controls select, .controls input { margin-top: 5px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
.controls button { padding: 8px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; }
.controls button:hover { background-color: #2980b9; }

.results { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
@media (max-width: 768px) { .results { grid-template-columns: 1fr; } }
.path-tree { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
.path-tree h3 { margin-top: 0; color: #2c3e50; }
</style>