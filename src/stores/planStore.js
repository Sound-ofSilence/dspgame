import { defineStore } from 'pinia';
import { ref } from 'vue';
import { buildPathTree } from '../engine/pathFinder';
import { calculateProduction } from '../engine/calculator';
import { useRecipeStore } from './recipeStore';

export const usePlanStore = defineStore('plan', () => {
  const targetItemId = ref(1106); // 电路板
  const targetPerMin = ref(60);
  const selectedRecipes = ref({});
  const selectedBuildings = ref({});
  const result = ref(null);
  const currentTree = ref(null);
  
  // 开关：显示树形图详细数据
  const showTreeDetails = ref(true);
  // 开关：鼠标悬停显示浮窗
  const showHoverDetails = ref(true);
  
  // 全局图鉴视图模式：'table' 或 'graph'
  const catalogViewMode = ref('graph');

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
    showTreeDetails, showHoverDetails, catalogViewMode,
    calculate, selectRecipe, selectBuilding 
  };
});