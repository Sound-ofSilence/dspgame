<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const chartRef = ref(null);
let chartInstance = null;

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  const items = Object.values(recipeStore.items);
  const nodes = items.map(item => ({
    id: String(item.ID),
    name: item.Name,
    symbolSize: item.Type === 4 ? 30 : 20, // 建筑节点大一些
    itemStyle: { color: item.Type === 4 ? '#e6a23c' : '#409eff' }
  }));

  const links = [];
  recipeStore.recipes.forEach(recipe => {
    const resultId = String(recipe.Results[0]);
    recipe.Items.forEach((inputId, idx) => {
      links.push({
        source: String(inputId),
        target: resultId,
        value: recipe.ItemCounts[idx],
        label: { show: true, formatter: `x${recipe.ItemCounts[idx]}` }
      });
    });
  });

  // 限制最多显示节点数，防止卡顿。如果数据过大，可以只展示当前选中物品的局部图。
  // 这里展示所有节点，并设置为按需渲染。
  const option = {
    title: { text: '物品合成关系网', left: 'center' },
    tooltip: { formatter: params => params.dataType === 'edge' ? `输入: ${params.data.source} -> 输出: ${params.data.target}` : params.name },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes,
      links: links,
      roam: true, // 支持拖拽缩放
      label: { show: true, position: 'right', fontSize: 10 },
      force: { repulsion: 200, edgeLength: 100 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 4 } }
    }]
  };

  chartInstance.setOption(option);
}

onMounted(() => { initChart(); });
onBeforeUnmount(() => { if (chartInstance) chartInstance.dispose(); });
</script>

<template>
  <div ref="chartRef" class="graph-container"></div>
</template>

<style scoped>
.graph-container { width: 100%; height: 75vh; background: var(--panel-bg); border-radius: 8px; border: 1px solid var(--border-color); }
</style>