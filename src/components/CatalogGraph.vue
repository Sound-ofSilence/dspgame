<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const chartRef = ref(null);
let chartInstance = null;
const selectedItemIds = ref([]);
const allOptions = ref([]);

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  renderChart();
}

function renderChart() {
  if (!chartInstance) return;
  
  // 过滤：如果没选，默认展示部分常用物品（防止节点过多）
  let targetIds = selectedItemIds.value;
  if (targetIds.length === 0) {
    targetIds = Object.values(recipeStore.items).slice(0, 50).map(i => i.ID); 
  }

  const nodeIds = new Set(targetIds);
  const nodes = Object.values(recipeStore.items)
    .filter(i => nodeIds.has(i.ID))
    .map(item => ({
      id: String(item.ID),
      name: item.Name,
      symbolSize: item.Type === 4 ? 35 : 20,
      itemStyle: { color: item.Type === 4 ? '#e6a23c' : '#409eff' }
    }));

  const links = [];
  recipeStore.recipes.forEach(recipe => {
    const resultId = recipe.Results[0];
    if (nodeIds.has(resultId)) {
      recipe.Items.forEach((inputId, idx) => {
        if (nodeIds.has(inputId)) {
          links.push({
            source: String(inputId),
            target: String(resultId),
            value: recipe.ItemCounts[idx],
            label: { show: true, formatter: `x${recipe.ItemCounts[idx]}`, fontSize: 10 }
          });
        }
      });
    }
  });

  chartInstance.setOption({
    title: { text: `物品合成关系网 (当前展示 ${nodes.length} 个节点)`, left: 'center' },
    tooltip: { formatter: params => params.dataType === 'edge' ? `${params.data.source} -> ${params.data.target}` : params.name },
    series: [{
      type: 'graph', layout: 'force', data: nodes, links: links, roam: true,
      force: { repulsion: 500, edgeLength: 150, gravity: 0.05 },
      label: { show: true, position: 'right', fontSize: 10 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 4 } }
    }]
  }, true);
}

function handleConfirm() {
  renderChart();
}

onMounted(() => {
  // 初始化选项
  allOptions.value = Object.values(recipeStore.items).map(i => ({ value: i.ID, label: i.Name }));
  initChart();
});

onBeforeUnmount(() => { if (chartInstance) chartInstance.dispose(); });
</script>

<template>
  <div class="graph-wrapper">
    <div class="graph-toolbar">
      <el-select v-model="selectedItemIds" multiple filterable collapse-tags placeholder="选择要展示的物品/建筑" style="width: 400px;">
        <el-option v-for="item in allOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" @click="handleConfirm">确定并更新网络</el-button>
      <span class="hint">提示：默认展示前50个节点，选择特定节点可精确渲染。</span>
    </div>
    <div ref="chartRef" class="graph-container"></div>
  </div>
</template>

<style scoped>
.graph-wrapper { display: flex; flex-direction: column; height: 75vh; }
.graph-toolbar { margin-bottom: 10px; display: flex; align-items: center; gap: 15px; }
.hint { font-size: 12px; color: var(--text-sub); }
.graph-container { flex: 1; width: 100%; background: var(--panel-bg); border-radius: 8px; border: 1px solid var(--border-color); }
</style>