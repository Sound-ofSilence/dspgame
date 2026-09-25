// scripts/testEngine.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPathTree } from '../src/engine/pathFinder.js';
import { calculateProduction } from '../src/engine/calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 读取我们刚才准备的 JSON 数据
const recipesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/recipes.json'), 'utf-8'));
const itemsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/items.json'), 'utf-8'));
const buildingsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/buildings.json'), 'utf-8'));

// 2. 构建索引（方便查找）
const recipes = recipesData.recipes;
const recipesById = {};
const recipesByResult = {};

recipes.forEach(r => {
  recipesById[r.ID] = r;
  r.Results.forEach(resultId => {
    if (!recipesByResult[resultId]) recipesByResult[resultId] = [];
    recipesByResult[resultId].push(r);
  });
});

// 3. 开始计算
const TARGET_ITEM_ID = 1106; // 电路板
const TARGET_PER_MIN = 60;   // 目标每分钟产量 60

console.log(`\n开始计算: 生产 ${TARGET_PER_MIN}/分钟 的 [${itemsData[TARGET_ITEM_ID].Name}]...\n`);

// 构建树
const tree = buildPathTree(TARGET_ITEM_ID, recipesById, recipesByResult, { selectedRecipes: new Map() });

// 计算结果
const result = calculateProduction(tree, recipesById, buildingsData, TARGET_PER_MIN);

// 4. 打印结果
console.log('--- 生产建筑需求 ---');
result.nodes.forEach(node => {
  const name = itemsData[node.itemId]?.Name || `未知(${node.itemId})`;
  if (node.isRaw) {
    console.log(`[原矿] ${name}: ${node.requiredPerMin.toFixed(2)} /分钟`);
  } else {
    const buildingName = buildingsData[node.buildingId]?.Name || '未知建筑';
    console.log(`[${buildingName}] ${name}: 需要 ${node.buildingCount} 台，产量 ${node.requiredPerMin.toFixed(2)} /分钟`);
  }
});

console.log('\n--- 原材料总需求 ---');
Object.keys(result.rawMaterials).forEach(itemId => {
  const name = itemsData[itemId]?.Name || `未知(${itemId})`;
  console.log(`${name}: ${result.rawMaterials[itemId].toFixed(2)} /分钟`);
});

console.log(`\n总电力消耗: ${(result.totalPower / 1000).toFixed(2)} MW\n`);