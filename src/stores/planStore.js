import { defineStore } from 'pinia';
import { ref } from 'vue';
import { buildPathTree } from '../engine/pathFinder';
import { calculateProduction } from '../engine/calculator';
import { useRecipeStore } from './recipeStore';

export const usePlanStore = defineStore('plan', () => {
  const targetItemId = ref(1106);
  const targetPerMin = ref(60);
  const selectedRecipes = ref({});
  const selectedBuildings = ref({});
  const result = ref(null);
  const currentTree = ref(null);
  
  const showTreeDetails = ref(true);
  const showHoverDetails = ref(true);
  const catalogViewMode = ref('graph'); 
  const hoverDisplayMode = ref('ratio');
  const timeUnit = ref('min');

  // 新增：是否启用“点击固化悬浮窗”功能
  const enableStickyPopover = ref(false);

  const formatRate = (perMin) => {
    if (perMin === undefined || perMin === null) return '0';
    if (timeUnit.value === 'hour') return (perMin * 60).toFixed(0) + ' /小时';
    if (timeUnit.value === 'sec') return (perMin / 60).toFixed(2) + ' /秒';
    return perMin.toFixed(1) + ' /分钟';
  };

  function selectRecipe(itemId, recipeId) {
    selectedRecipes.value[itemId] = recipeId;
    selectedRecipes.value = { ...selectedRecipes.value };
    calculate();
  }

  function selectBuilding(itemId, buildingId) {
    selectedBuildings.value[itemId] = buildingId;
    selectedBuildings.value = { ...selectedBuildings.value };
    calculate();
  }

  function calculate() {
    const recipeStore = useRecipeStore();
    if (!targetItemId.value) return;
    const tree = buildPathTree(targetItemId.value, recipeStore.recipesById, recipeStore.recipesByResult, {
      selectedRecipes: selectedRecipes.value,
      selectedBuildings: selectedBuildings.value
    });
    result.value = calculateProduction(tree, recipeStore.recipesById, recipeStore.buildings, targetPerMin.value);
    currentTree.value = tree;
  }

  return { 
    targetItemId, targetPerMin, selectedRecipes, selectedBuildings, result, currentTree,
    showTreeDetails, showHoverDetails, catalogViewMode, hoverDisplayMode, timeUnit,
    enableStickyPopover,
    formatRate,
    calculate, selectRecipe, selectBuilding 
  };
});