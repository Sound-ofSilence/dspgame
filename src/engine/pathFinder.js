// src/engine/pathFinder.js

const RAW_MATERIALS = new Set([1001, 1002]);

export function buildPathTree(itemId, recipesById, recipesByResult, options = {}) {
  const { selectedRecipes = new Map(), visited = new Set() } = options;

  if (RAW_MATERIALS.has(itemId)) {
    return { itemId, isRaw: true, children: [] };
  }

  if (visited.has(itemId)) {
    return { itemId, isCircular: true, children: [] };
  }

  const recipes = recipesByResult[itemId];
  if (!recipes || recipes.length === 0) {
    return { itemId, isRaw: true, children: [] };
  }

  const recipeId = selectedRecipes.get(itemId);
  const recipe = recipeId ? recipesById[recipeId] : recipes[0];

  const newVisited = new Set(visited).add(itemId);

  const children = recipe.Items.map((inputItemId, idx) => {
    const childNode = buildPathTree(inputItemId, recipesById, recipesByResult, {
      selectedRecipes,
      visited: newVisited,
    });
    return { ...childNode, qtyPerCraft: recipe.ItemCounts[idx] };
  });

  return {
    itemId,
    recipeId: recipe.ID,
    isRaw: false,
    isCircular: false,
    children,
  };
}