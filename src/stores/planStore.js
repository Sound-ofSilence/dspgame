import { defineStore } from 'pinia';
import { ref } from 'vue';
import { buildPathTree } from '../engine/pathFinder';
import { calculateProduction } from '../engine/calculator';
import { useRecipeStore } from './recipeStore';

export const usePlanStore = defineStore('plan', () => {
  const targetItemId = ref(null);
  const targetPerMin = ref(60);
  const buildingSpeedMultiplier = ref(1.0);
  const selectedRecipes = ref(new Map()); // 后续用于切换配方
  const result = ref(null);

  function calculate() {
    const recipeStore = useRecipeStore();
    if (!targetItemId.value) return;

    // 1. 构建树
    const tree = buildPathTree(
      targetItemId.value,
      recipeStore.recipesById,
      recipeStore.recipesByResult,
      { selectedRecipes: selectedRecipes.value }
    );

    // 2. 计算产能
    result.value = calculateProduction(
      tree,
      recipeStore.recipesById,
      recipeStore.buildings,
      targetPerMin.value,
      buildingSpeedMultiplier.value
    );
  }

  return { targetItemId, targetPerMin, buildingSpeedMultiplier, selectedRecipes, result, calculate };
});