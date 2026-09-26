// scripts/transformRealData.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 根据用户提供的 Wiki 名单整理的建筑列表
const BUILDING_NAMES = [
  '采矿机', '大型采矿机', '抽水站', '原油萃取站', '轨道采集器',
  '电弧熔炉', '位面熔炉',
  '制造台Mk.I', '制造台Mk.II', '制造台Mk.III', '自动集装机',
  '原油精炼厂', '化工厂', '分馏塔', '微型粒子对撞机', '矩阵研究站',
  '风力涡轮机', '火力发电厂', '太阳能板', '地热发电站', '微型聚变发电站', '人造恒星',
  '电力感应塔', '无线输电塔', '卫星配电站', '蓄电器', '蓄电器（满）', '能量枢纽',
  '传送带Mk.I', '传送带Mk.II', '传送带Mk.III', '分拣器Mk.I', '分拣器Mk.II', '分拣器Mk.III', '四向分流器',
  '小型储物仓', '大型储物仓', '储液罐',
  '行星内物流运输站', '星际物流运输站', '物流配送器',
  '电磁轨道弹射器', '垂直发射井', '射线接收站',
  '喷涂机', '流速监控器',
  '高斯机枪塔', '高能激光塔', '聚爆加农炮', '导弹防御塔', '磁化电浆炮',
  '信号塔', '行星护盾发生器', '战场分析基站'
];

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Vanilla.json'), 'utf-8'));

const itemList = rawData.items || [];
const recipeList = rawData.recipes || [];

// 1. 构建物品映射 (itemId -> item)，并打上 Category 标签
const items = {};
itemList.forEach(item => {
  // 判断是否是建筑：名字完全包含在列表中，或者包含特定关键字（防止名称有细微差异）
  const isBuilding = BUILDING_NAMES.includes(item.Name) || 
                     item.Name.includes('制造台') || 
                     item.Name.includes('传送带') || 
                     item.Name.includes('分拣器') ||
                     item.Name.includes('熔炉');

  items[item.ID] = {
    ID: item.ID,
    Name: item.Name,
    Type: item.Type || 0,
    StackSize: item.StackSize || 0,
    Category: isBuilding ? 'building' : 'item', // 新增的分类标签
  };
});

// 2. 构建建筑映射 (仅保留建筑，用于计算速度和功耗)
const buildings = {};
itemList.forEach(item => {
  // 通过我们上面定义好的 Category 标签来筛选建筑，确保不会遗漏
  const isBuilding = BUILDING_NAMES.includes(item.Name) || 
                     item.Name.includes('制造台') || 
                     item.Name.includes('传送带') || 
                     item.Name.includes('分拣器') ||
                     item.Name.includes('熔炉');
                     
  if (isBuilding) {
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