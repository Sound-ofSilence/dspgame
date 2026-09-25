// src/engine/calculator.js

export function calculateProduction(tree, recipesById, buildingsById, targetPerMin, buildingSpeedMultiplier = 1.0) {
  const result = { nodes: [], totalPower: 0, rawMaterials: {} };

  function traverse(node, requiredPerMin) {
    const recipe = node.recipeId ? recipesById[node.recipeId] : null;

    if (node.isRaw || !recipe) {
      result.rawMaterials[node.itemId] = (result.rawMaterials[node.itemId] || 0) + requiredPerMin;
      result.nodes.push({
        itemId: node.itemId,
        requiredPerMin,
        isRaw: true,
        buildingCount: 0,
        buildingId: null,
        power: 0,
      });
      return;
    }

    const timeSec = recipe.TimeSpend / 60;
    const outputQty = recipe.ResultCounts[0];
    const perBuildingPerMin = (outputQty / timeSec) * 60 * buildingSpeedMultiplier;
    const buildingCount = Math.ceil(requiredPerMin / perBuildingPerMin);

    const buildingId = recipe.Factories[0];
    const building = buildingsById[buildingId];
    
    // 样本数据中无真实功耗，这里给个 360kW 作为演示
    const power = buildingCount * 360; 
    
    result.nodes.push({
      itemId: node.itemId,
      requiredPerMin,
      isRaw: false,
      buildingCount,
      buildingId,
      power,
      recipeId: recipe.ID,
    });
    result.totalPower += power;

    recipe.Items.forEach((inputItemId, idx) => {
      const childNode = node.children.find(c => c.itemId === inputItemId);
      const qtyPerCraft = recipe.ItemCounts[idx];
      const childRequiredPerMin = (requiredPerMin / outputQty) * qtyPerCraft;
      if (childNode) {
        traverse(childNode, childRequiredPerMin);
      }
    });
  }

  traverse(tree, targetPerMin);
  return result;
}