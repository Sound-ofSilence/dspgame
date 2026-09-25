import { defineStore } from 'pinia';
import { ref } from 'vue';
import { buildPathTree } from '../engine/pathFinder';
import { calculateProduction } from '../engine/calculator';
import { useRecipeStore } from './recipeStore';

export const usePlanStore = defineStore('plan', () => {
  const targetItemId = ref(1106); // 默认电路板
  const targetPerMin = ref(60);
  const buildingSpeedMultiplier = ref(1.0);
  const selectedRecipes = ref({}); // 用普通对象代替 Map，避免响应式失效
  const result = ref(null);

  // 切换配方的方法
  function selectRecipe(itemId, recipeId) {
    selectedRecipes.value[itemId] = recipeId;
    // 强制触发更新
    selectedRecipes.value = { ...selectedRecipes.value };
  }

  function calculate() {
    const recipeStore = useRecipeStore();
    if (!targetItemId.value) return;

    // 构建树
    const tree = buildPathTree(
      targetItemId.value,
      recipeStore.recipesById,
      recipeStore.recipesByResult,
      { selectedRecipes: selectedRecipes.value }
    );

    // 计算产能
    result.value = calculateProduction(
      tree,
      recipeStore.recipesById,
      recipeStore.buildings,
      targetPerMin.value,
      buildingSpeedMultiplier.value
    );
  }

  return { 
    targetItemId, 
    targetPerMin, 
    buildingSpeedMultiplier, 
    selectedRecipes, 
    result, 
    calculate, 
    selectRecipe 
  };
});