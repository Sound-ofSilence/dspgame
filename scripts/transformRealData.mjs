// scripts/transformRealData.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Vanilla.json'), 'utf-8'));

// Vanilla.json 的结构通常是 { items: [...], recipes: [...] } 或者是单独的数组
// 我们根据实际结构去提取，这里做了兼容性处理
const itemList = rawData.items || [];
const recipeList = rawData.recipes || [];

// 1. 构建物品映射 (itemId -> item)
const items = {};
itemList.forEach(item => {
  items[item.ID] = {
    ID: item.ID,
    Name: item.Name,
    Type: item.Type || 0,
    StackSize: item.StackSize || 0,
  };
});

// 2. 构建建筑映射 (仅保留建筑，其他过滤掉)
const buildings = {};
itemList.forEach(item => {
  if (item.Type === 4 || item.Type === 5 || item.Type === 6 || item.Type === 7 || item.Name.includes('制造台') || item.Name.includes('熔炉')) {
    buildings[item.ID] = {
      ID: item.ID,
      Name: item.Name,
      Speed: item.Speed || 1.0,
      WorkEnergyPerTick: item.WorkEnergyPerTick || 0,
    };
  }
});

// 3. 提取配方
const recipes = recipeList.map(r => ({
  ID: r.ID,
  Name: r.Name,
  Type: r.Type,
  Factories: r.Factories || [],
  Items: r.Items || [],
  ItemCounts: r.ItemCounts || [],
  Results: r.Results || [],
  ResultCounts: r.ResultCounts || [],
  TimeSpend: r.TimeSpend || 60,
  Proliferator: r.Proliferator || 1,
}));

fs.writeFileSync(path.join(__dirname, '../data/recipes.json'), JSON.stringify({ recipes }, null, 2));
fs.writeFileSync(path.join(__dirname, '../data/items.json'), JSON.stringify(items, null, 2));
fs.writeFileSync(path.join(__dirname, '../data/buildings.json'), JSON.stringify(buildings, null, 2));

console.log(`✅ 数据清洗完成！配方数: ${recipes.length}, 物品数: ${Object.keys(items).length}, 建筑数: ${Object.keys(buildings).length}`);