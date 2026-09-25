import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import recipesData from '../../data/recipes.json';
import itemsData from '../../data/items.json';
import buildingsData from '../../data/buildings.json';

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref(recipesData.recipes);
  const items = ref(itemsData);
  const buildings = ref(buildingsData);

  // 索引：itemId -> 可产出该物品的配方列表
  const recipesByResult = computed(() => {
    const map = {};
    recipes.value.forEach(r => {
      r.Results.forEach(resultId => {
        if (!map[resultId]) map[resultId] = [];
        map[resultId].push(r);
      });
    });
    return map;
  });

  // 索引：recipeId -> recipe
  const recipesById = computed(() => {
    const map = {};
    recipes.value.forEach(r => { map[r.ID] = r; });
    return map;
  });

  function getItemName(itemId) {
    return items.value[itemId]?.Name || `Unknown(${itemId})`;
  }

  function getBuildingName(buildingId) {
    return buildings.value[buildingId]?.Name || `Unknown(${buildingId})`;
  }

  return { recipes, items, buildings, recipesByResult, recipesById, getItemName, getBuildingName };
});