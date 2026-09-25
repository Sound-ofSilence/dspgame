// src/engine/pathFinder.js

const RAW_MATERIALS = new Set([1001, 1002]);

/**
 * 构建合成路径树
 */
export function buildPathTree(itemId, recipesById, recipesByResult, options = {}) {
  const { selectedRecipes = {}, visited = new Set() } = options;

  // 1. 原始资源停止递归
  if (RAW_MATERIALS.has(itemId)) {
    return { itemId, isRaw: true, children: [] };
  }

  // 2. 循环依赖检测
  if (visited.has(itemId)) {
    return { itemId, isCircular: true, children: [] };
  }

  // 3. 找配方
  const recipes = recipesByResult[itemId];
  if (!recipes || recipes.length === 0) {
    return { itemId, isRaw: true, children: [] };
  }

  // 4. 选择配方（兼容 Map 和普通对象）
  let recipeId = null;
  if (selectedRecipes instanceof Map) {
    recipeId = selectedRecipes.get(itemId);
  } else {
    recipeId = selectedRecipes[itemId];
  }
  
  const recipe = recipeId ? recipesById[recipeId] : recipes[0];

  const newVisited = new Set(visited).add(itemId);

  // 5. 递归展开
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