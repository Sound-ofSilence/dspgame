<script setup>
import { computed, ref } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';
import { usePlanStore } from '../stores/planStore';

defineOptions({ name: 'RecipeTreeNode' });

const props = defineProps({
  node: { type: Object, required: true },
});

const recipeStore = useRecipeStore();
const planStore = usePlanStore();

// 固化浮窗管理（每个节点实例独立）
const stickyWindows = ref([]);

const itemName = computed(() => recipeStore.getItemName(props.node.itemId));

const availableRecipes = computed(() => {
  if (props.node.isRaw || !props.node.itemId) return [];
  return recipeStore.recipesByResult[props.node.itemId] || [];
});

const availableBuildings = computed(() => {
  const recipe = recipeStore.recipesById[props.node.recipeId];
  if (!recipe) return [];
  return recipe.Factories.map(id => recipeStore.buildings[id]).filter(Boolean);
});

const currentRecipe = computed(() => {
  return props.node.recipeId ? recipeStore.recipesById[props.node.recipeId] : null;
});

const materialDisplayList = computed(() => {
  if (!currentRecipe.value) return [];
  const resultQty = currentRecipe.value.ResultCounts[0] || 1;
  return currentRecipe.value.Items.map((inputId, idx) => {
    const ratio = currentRecipe.value.ItemCounts[idx];
    const amount = planStore.hoverDisplayMode === 'ratio' ? ratio : (props.node.requiredPerMin / resultQty) * ratio;
    const unit = planStore.hoverDisplayMode === 'ratio' ? '个' : planStore.formatRate(amount);
    return { name: recipeStore.getItemName(inputId), amount: unit };
  });
});

function onRecipeChange(event) {
  planStore.selectRecipe(props.node.itemId, Number(event.target.value));
}

function onBuildingChange(event) {
  planStore.selectBuilding(props.node.itemId, Number(event.target.value));
}

// 点击节点：开启固化浮窗时弹出新窗口
function handleNodeClick(event) {
  if (!planStore.enableStickyPopover || props.node.isRaw) return;
  
  const newWindow = {
    id: Date.now() + Math.random(),
    node: props.node,
    x: Math.min(event.clientX + 20, window.innerWidth - 640),
    y: Math.min(event.clientY + 20, window.innerHeight - 520),
    depth: stickyWindows.value.length,
  };
  stickyWindows.value.push(newWindow);
}

function closeWindow(id) {
  stickyWindows.value = stickyWindows.value.filter(w => w.id !== id);
}
</script>

<template>
  <div class="tree-node-wrapper" :class="{ 'is-child': node.depth > 0 }">
    <!-- 悬停提示 -->
    <el-tooltip 
      placement="right" 
      :disabled="!planStore.showHoverDetails || node.isRaw || planStore.enableStickyPopover" 
      effect="light"
    >
      <template #content>
        <div class="hover-card" v-if="currentRecipe">
          <div class="hover-title">🛠️ {{ itemName }} 配方详情</div>
          <div class="hover-row"><strong>耗时:</strong> {{ (currentRecipe.TimeSpend / 60).toFixed(1) }} 秒</div>
          <div class="hover-row"><strong>产出:</strong> {{ recipeStore.getItemName(currentRecipe.Results[0]) }} × {{ currentRecipe.ResultCounts[0] }}</div>
          <div class="hover-divider"></div>
          <div class="hover-row"><strong>输入材料:</strong></div>
          <ul class="hover-list">
            <li v-for="(mat, idx) in materialDisplayList" :key="idx">{{ mat.name }} × {{ mat.amount }}</li>
          </ul>
        </div>
      </template>

      <div class="tree-node-content" @click.stop="handleNodeClick">
        <span v-if="node.isRaw" class="tag raw">原矿</span>
        <span v-else-if="node.isCircular" class="tag circular">循环</span>
        <span class="item-name">{{ itemName }}</span>
        <span v-if="node.qtyPerCraft" class="qty">×{{ node.qtyPerCraft }}</span>
        <span v-if="planStore.showTreeDetails && !node.isRaw" class="detail-box">
          <span class="detail-item demand">{{ planStore.formatRate(node.requiredPerMin) }}</span>
          <span class="detail-item building">{{ node.buildingCount }} 台</span>
        </span>
        <select v-if="availableRecipes.length > 1" :value="node.recipeId" @change="onRecipeChange" class="mini-select" @click.stop>
          <option v-for="r in availableRecipes" :key="r.ID" :value="r.ID">{{ r.Name || ('路线 ' + r.ID) }}</option>
        </select>
        <select v-if="availableBuildings.length > 1" :value="node.selectedBuildingId || node.buildingId" @change="onBuildingChange" class="mini-select building-select" @click.stop>
          <option v-for="b in availableBuildings" :key="b.ID" :value="b.ID">{{ b.Name }} (x{{ b.Speed }})</option>
        </select>
      </div>
    </el-tooltip>

    <!-- 递归子节点 -->
    <div class="tree-children" v-if="node.children && node.children.length">
      <RecipeTreeNode v-for="(child, idx) in node.children" :key="idx" :node="child" />
    </div>

    <!-- 固化浮窗：使用 Teleport 挂载到 body，绝对定位 -->
    <Teleport to="body">
      <div
        v-for="win in stickyWindows"
        :key="win.id"
        class="sticky-window"
        :style="{ left: win.x + 'px', top: win.y + 'px', zIndex: 3000 + win.depth }"
      >
        <div class="sticky-header">
          <span>🌲 合成树: {{ recipeStore.getItemName(win.node.itemId) }}</span>
          <button class="close-btn" @click="closeWindow(win.id)">✕ 关闭</button>
        </div>
        <div class="sticky-body">
          <RecipeTreeNode :node="win.node" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tree-node-wrapper { position: relative; padding-left: 28px; margin-bottom: 6px; }
.tree-node-wrapper:not(.is-child) { padding-left: 0; }
.is-child::before { content: ''; position: absolute; left: 12px; top: -6px; bottom: 0; border-left: 2px solid var(--border-color); }
.is-child::after { content: ''; position: absolute; left: 12px; top: 20px; width: 14px; border-top: 2px solid var(--border-color); }
.tree-children > .is-child:last-child::before { bottom: 50%; }

.tree-node-content {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 10px;
  padding: 6px 12px; font-family: monospace; font-size: 13px;
  background: var(--panel-bg); border: 1px solid var(--border-color);
  border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  cursor: pointer; transition: all 0.2s;
}
.tree-node-content:hover { border-color: #409eff; box-shadow: 0 4px 12px rgba(64,158,255,0.15); }

.tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.raw { background-color: #fdf6ec; color: #e6a23c; border: 1px solid #f5dab1; }
.circular { background-color: #fef0f0; color: #f56c6c; border: 1px solid #fbc4c4; }
.item-name { color: var(--text-main); font-weight: bold; font-size: 14px; }
.qty { color: var(--text-sub); }

.detail-box { display: flex; gap: 4px; font-size: 12px; }
.detail-item { padding: 2px 6px; border-radius: 4px; }
.demand { background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff; }
.building { background: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8; font-weight: bold; }

.mini-select { padding: 2px 4px; font-size: 11px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-main); outline: none; cursor: pointer; }
.building-select { color: #e6a23c; background: #fdf6ec; border-color: #f5dab1; }

.hover-card { padding: 5px; font-size: 13px; color: var(--text-main); min-width: 250px; }
.hover-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; }
.hover-row { margin-bottom: 6px; display: flex; gap: 6px; }
.hover-divider { height: 1px; background: var(--border-color); margin: 8px 0; }
.hover-list { margin: 0; padding-left: 20px; color: #409eff; }
.hover-list li { margin-bottom: 4px; }
</style>

<!-- 全局样式：固化浮窗挂载在 body 上，需要非 scoped -->
<style>
.sticky-window {
  position: fixed;
  width: 620px;
  max-height: 500px;
  background: #ffffff;
  border: 2px solid #409eff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sticky-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #ecf5ff;
  color: #409eff;
  font-weight: bold;
  font-size: 14px;
}
.close-btn {
  background: transparent;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #409eff;
  padding: 2px 8px;
  transition: all 0.2s;
}
.close-btn:hover { color: #f56c6c; border-color: #f56c6c; background: #fef0f0; }
.sticky-body {
  flex: 1;
  overflow: auto;
  padding: 10px;
  background: #f8f9fa;
}
</style>