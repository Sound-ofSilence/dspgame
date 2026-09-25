<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const chartRef = ref(null);
let chartInstance = null;
const keyword = ref('');

function renderChart() {
  if (!chartInstance) return;
  
  // 桑基图非常适合展示流动，但全量数据会导致节点爆炸。
  // 策略：基于搜索词，寻找相关的上下游节点（限制深度），生成局部桑基图。
  const items = Object.values(recipeStore.items);
  let targetItem = null;
  if (keyword.value) {
    targetItem = items.find(i => i.Name.includes(keyword.value));
  }

  // 如果没有搜索，默认展示基础物品（铁矿、铜矿等）流向铁块、铜块的简单链条
  const nodesMap = new Map();
  const links = [];
  
  // 兜底逻辑：如果没有搜索，只渲染铁块和铜块的简单链条
  let targetIds = [];
  if (targetItem) {
    targetIds = [targetItem.ID];
  } else {
    targetIds = [1101, 1103, 1106]; // 铁块, 铜块, 电路板
  }

  // 广度优先遍历，限制深度为3
  const queue = targetIds.map(id => ({ id, depth: 0 }));
  const visited = new Set();
  
  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (visited.has(id) || depth > 3) continue;
    visited.add(id);

    // 添加节点
    if (!nodesMap.has(String(id))) {
      const item = recipeStore.items[id];
      if (item) {
        nodesMap.set(String(id), {
          name: item.Name,
          itemStyle: { color: item.Type === 4 ? '#e6a23c' : '#409eff' }
        });
      }
    }

    // 寻找产出该物品的配方
    const recipes = recipeStore.recipesByResult[id];
    if (recipes && recipes.length > 0) {
      // 取第一个配方
      const recipe = recipes[0];
      recipe.Items.forEach((inputId, idx) => {
        // 添加连线
        links.push({
          source: recipeStore.items[inputId]?.Name || String(inputId),
          target: recipeStore.items[id]?.Name || String(id),
          value: recipe.ItemCounts[idx]
        });
        // 添加输入节点
        if (!nodesMap.has(String(inputId))) {
          const inputItem = recipeStore.items[inputId];
          if (inputItem) {
            nodesMap.set(String(inputId), {
              name: inputItem.Name,
              itemStyle: { color: inputItem.Type === 4 ? '#e6a23c' : '#409eff' }
            });
          }
        }
        // 继续往上找
        if (!visited.has(inputId)) {
          queue.push({ id: inputId, depth: depth + 1 });
        }
      });
    }
  }

  const nodes = Array.from(nodesMap.values());

  const option = {
    title: { text: keyword.value ? `流向图: ${keyword.value}` : '物品合成流向图 (默认展示基础链条)', left: 'center' },
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      data: nodes,
      links: links,
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { position: 'right', fontSize: 12 }
    }]
  };
  chartInstance.setOption(option, true);
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    renderChart();
  }
});

watch(keyword, () => { renderChart(); });

onBeforeUnmount(() => { if (chartInstance) chartInstance.dispose(); });
</script>

<template>
  <div class="sankey-wrapper">
    <div class="sankey-toolbar">
      <el-input v-model="keyword" placeholder="输入最终产物名，查看其上游供应链流向..." clearable style="width: 300px;" />
      <span class="hint">桑基图清晰地展示了物品从原材料到成品的层级流动关系。</span>
    </div>
    <div ref="chartRef" class="sankey-container"></div>
  </div>
</template>

<style scoped>
.sankey-wrapper { display: flex; flex-direction: column; height: 75vh; }
.sankey-toolbar { margin-bottom: 10px; display: flex; align-items: center; gap: 15px; }
.hint { font-size: 12px; color: var(--text-sub); }
.sankey-container { flex: 1; width: 100%; background: var(--panel-bg); border-radius: 8px; border: 1px solid var(--border-color); }
</style>