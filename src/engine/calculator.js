// src/engine/calculator.js

export function calculateProduction(tree, recipesById, buildingsById, targetPerMin, buildingSpeedMultiplier = 1.0) {
  const result = { nodes: [], totalPower: 0, rawMaterials: {}, totalMachines: 0 };

  function traverse(node, requiredPerMin, depth = 0) {
    node.depth = depth;
    node.requiredPerMin = requiredPerMin;

    const recipe = node.recipeId ? recipesById[node.recipeId] : null;

    // 原始资源
    if (node.isRaw || !recipe) {
      node.buildingCount = 0;
      node.buildingId = null;
      node.power = 0;
      result.rawMaterials[node.itemId] = (result.rawMaterials[node.itemId] || 0) + requiredPerMin;
      result.nodes.push({ itemId: node.itemId, requiredPerMin, isRaw: true, buildingCount: 0, buildingId: null, power: 0, depth });
      return;
    }

    // 使用传入的指定建筑，或者该配方默认的第一个建筑
    const buildingId = node.selectedBuildingId || recipe.Factories[0];
    const building = buildingsById[buildingId] || {};
    
    // 动态获取建筑速度倍率
    const speed = building.Speed || 1.0;
    const timeSec = recipe.TimeSpend / 60;
    const outputQty = recipe.ResultCounts[0];
    // 单栋建筑每分钟产量 = (产出数量 / 时间秒数) * 60 * 建筑速度
    const perBuildingPerMin = (outputQty / timeSec) * 60 * speed;
    const buildingCount = Math.ceil(requiredPerMin / perBuildingPerMin);

    const power = buildingCount * 360; // 基础功耗暂定为360kW，后续可以替换

    node.buildingCount = buildingCount;
    node.buildingId = buildingId;
    node.power = power;

    result.nodes.push({ itemId: node.itemId, requiredPerMin, isRaw: false, buildingCount, buildingId, power, recipeId: recipe.ID, depth });
    result.totalPower += power;
    result.totalMachines += buildingCount;

    // 递归
    recipe.Items.forEach((inputItemId, idx) => {
      const childNode = node.children.find(c => c.itemId === inputItemId);
      const qtyPerCraft = recipe.ItemCounts[idx];
      const childRequiredPerMin = (requiredPerMin / outputQty) * qtyPerCraft;
      if (childNode) traverse(childNode, childRequiredPerMin, depth + 1);
    });
  }

  traverse(tree, targetPerMin, 0);
  return result;
}