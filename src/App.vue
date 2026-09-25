<script setup>
import { onMounted, watch, ref } from 'vue';
import { usePlanStore } from './stores/planStore';
import RecipeTreeNode from './components/RecipeTreeNode.vue';
import ProductionTable from './components/ProductionTable.vue';
import ItemSelector from './components/ItemSelector.vue';
import Catalog from './components/Catalog.vue';

const planStore = usePlanStore();
const activeTab = ref('plan');
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  document.body.className = isDark.value ? 'dark' : '';
}

watch([() => planStore.targetItemId, () => planStore.targetPerMin], () => planStore.calculate());
onMounted(() => planStore.calculate());
</script>

<template>
  <div class="app-container">
    <header class="top-bar">
      <div class="title-area">
        <h1>🌌 戴森球计划 - 产能规划工具</h1>
      </div>
      <div class="action-area">
        <el-button size="small" @click="toggleTheme">
          {{ isDark ? '☀️ 浅色模式' : '🌙 深色模式' }}
        </el-button>
        <el-button size="small" :type="activeTab === 'plan' ? 'primary' : 'default'" @click="activeTab = 'plan'">📊 产能规划</el-button>
        <el-button size="small" :type="activeTab === 'catalog' ? 'primary' : 'default'" @click="activeTab = 'catalog'">📖 全局图鉴</el-button>
      </div>
    </header>

    <!-- 使用 v-if 切换页面，解决组件状态丢失和 ECharts 渲染错误 -->
    <div v-if="activeTab === 'plan'">
      <el-card class="controls-card" shadow="hover">
        <div class="controls">
          <div class="control-item">
            <span class="label">目标类型：</span>
            <el-radio-group v-model="planStore.targetCategory" size="small">
              <el-radio-button value="item">物品</el-radio-button>
              <el-radio-button value="building">建筑</el-radio-button>
            </el-radio-group>
          </div>
          <div class="control-item">
            <span class="label">选择目标：</span>
            <ItemSelector v-model="planStore.targetItemId" :type="planStore.targetCategory" />
          </div>
          <div class="control-item">
            <span class="label">目标产量：</span>
            <el-input-number v-model="planStore.targetPerMin" :min="1" :step="10" size="small" />
          </div>
          <div class="control-item">
            <span class="label">单位：</span>
            <el-radio-group v-model="planStore.timeUnit" size="small">
              <el-radio-button value="min">/分</el-radio-button>
              <el-radio-button value="hour">/时</el-radio-button>
              <el-radio-button value="sec">/秒</el-radio-button>
            </el-radio-group>
          </div>
          <div class="control-item switch-item">
            <span class="label">悬浮框显示：</span>
            <el-radio-group v-model="planStore.hoverDisplayMode" size="small">
              <el-radio-button value="ratio">比例</el-radio-button>
              <el-radio-button value="quantity">数量</el-radio-button>
            </el-radio-group>
            <span class="label" style="margin-left: 10px;">悬停浮窗：</span>
            <el-switch v-model="planStore.showHoverDetails" />
            
            <!-- 新增：固化悬浮窗开关 -->
            <span class="label" style="margin-left: 10px; color: #e6a23c;">点击固化浮窗：</span>
            <el-switch v-model="planStore.enableStickyPopover" />
          </div>
        </div>
      </el-card>

      <div class="results">
        <el-card class="panel" shadow="hover">
          <template #header>
            <div class="panel-header">
              <span>🌳 合成路径树</span>
              <span class="sub-header">(悬停查看详情，点击可弹出固化浮窗)</span>
            </div>
          </template>
          <div class="tree-container">
            <RecipeTreeNode v-if="planStore.currentTree" :node="planStore.currentTree" />
            <el-empty v-else description="请选择目标物品或建筑" />
          </div>
        </el-card>

        <el-card class="panel" shadow="hover">
          <ProductionTable />
        </el-card>
      </div>
    </div>

    <div v-if="activeTab === 'catalog'" class="catalog-view">
      <Catalog />
    </div>
  </div>
</template>

<style scoped>
.app-container { min-height: 100vh; background-color: var(--bg-color); color: var(--text-main); padding: 20px; max-width: 1440px; margin: 0 auto; transition: background-color 0.3s; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.title-area h1 { font-size: 20px; margin: 0; color: var(--text-main); font-weight: 600; }
.action-area { display: flex; gap: 10px; }
.controls-card { margin-bottom: 16px; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.control-item { display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--text-main); font-size: 13px; }
.switch-item { margin-left: auto; color: #409eff; }
.results { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
@media (max-width: 1024px) { .results { grid-template-columns: 1fr; } }
.panel { height: 100%; border-radius: 8px; overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; }
.sub-header { font-size: 12px; color: var(--text-sub); font-weight: normal; }
.tree-container { min-height: 500px; max-height: 75vh; overflow-y: auto; padding: 10px; }
.tree-container::-webkit-scrollbar { width: 6px; }
.tree-container::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
.catalog-view { margin-top: 16px; }
</style>