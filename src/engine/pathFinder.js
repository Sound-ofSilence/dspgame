// src/engine/pathFinder.js
const RAW_MATERIALS = new Set([1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1030,1031]);

export function buildPathTree(itemId, recipesById, recipesByResult, options = {}) {
  const { selectedRecipes = {}, selectedBuildings = {}, visited = new Set() } = options;

  if (RAW_MATERIALS.has(itemId)) return { itemId, isRaw: true, children: [] };
  if (visited.has(itemId)) return { itemId, isCircular: true, children: [] };

  const recipes = recipesByResult[itemId];
  if (!recipes || recipes.length === 0) return { itemId, isRaw: true, children: [] };

  const recipeId = selectedRecipes[itemId];
  const recipe = recipeId ? recipesById[recipeId] : recipes[0];
  const selectedBuildingId = selectedBuildings[itemId]; // 读取用户选择建筑

  const newVisited = new Set(visited).add(itemId);
  const children = recipe.Items.map((inputItemId, idx) => {
    const childNode = buildPathTree(inputItemId, recipesById, recipesByResult, { selectedRecipes, selectedBuildings, visited: newVisited });
    return { ...childNode, qtyPerCraft: recipe.ItemCounts[idx] };
  });

  return {
    itemId,
    recipeId: recipe.ID,
    selectedBuildingId, // 透传下去
    isRaw: false,
    isCircular: false,
    children,
  };
}