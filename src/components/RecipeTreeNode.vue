<script setup>
import { computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';
import { usePlanStore } from '../stores/planStore';

defineOptions({ name: 'RecipeTreeNode' });

const props = defineProps({
  node: { type: Object, required: true },
});

const recipeStore = useRecipeStore();
const planStore = usePlanStore();

const itemName = computed(() => recipeStore.getItemName(props.node.itemId));

// 可选的配方
const availableRecipes = computed(() => {
  if (props.node.isRaw || !props.node.itemId) return [];
  return recipeStore.recipesByResult[props.node.itemId] || [];
});

// 可选的建筑
const availableBuildings = computed(() => {
  const recipe = recipeStore.recipesById[props.node.recipeId];
  if (!recipe) return [];
  return recipe.Factories.map(id => recipeStore.buildings[id]).filter(Boolean);
});

// 当前配方详情（用于浮窗）
const currentRecipe = computed(() => {
  return props.node.recipeId ? recipeStore.recipesById[props.node.recipeId] : null;
});

function onRecipeChange(event) {
  planStore.selectRecipe(props.node.itemId, Number(event.target.value));
}

function onBuildingChange(event) {
  planStore.selectBuilding(props.node.itemId, Number(event.target.value));
}
</script>

<template>
  <div class="tree-node-wrapper" :class="{ 'is-child': node.depth > 0 }">
    <el-popover
      placement="right"
      :width="300"
      trigger="hover"
      :disabled="!planStore.showHoverDetails || node.isRaw"
    >
      <template #reference>
        <!-- 树节点内容 -->
        <div class="tree-node-content">
          <span v-if="node.isRaw" class="tag raw">原矿</span>
          <span v-else-if="node.isCircular" class="tag circular">循环</span>

          <span class="item-name">{{ itemName }}</span>
          <span v-if="node.qtyPerCraft" class="qty">×{{ node.qtyPerCraft }}</span>

          <!-- 需求与建筑靠拢，放在一起 -->
          <span v-if="planStore.showTreeDetails && !node.isRaw" class="detail-box">
            <span class="detail-item demand">{{ node.requiredPerMin.toFixed(1) }}/分</span>
            <span class="detail-item building">{{ node.buildingCount }} 台</span>
          </span>

          <select v-if="availableRecipes.length > 1" :value="node.recipeId" @change="onRecipeChange" class="mini-select">
            <option v-for="r in availableRecipes" :key="r.ID" :value="r.ID">{{ r.Name || ('路线 ' + r.ID) }}</option>
          </select>

          <select v-if="availableBuildings.length > 1" :value="node.selectedBuildingId || node.buildingId" @change="onBuildingChange" class="mini-select building-select">
            <option v-for="b in availableBuildings" :key="b.ID" :value="b.ID">{{ b.Name }} (x{{ b.Speed }})</option>
          </select>
        </div>
      </template>

      <!-- 悬停浮窗内容 -->
      <div class="hover-card" v-if="currentRecipe">
        <div class="hover-title">🛠️ {{ itemName }} 配方详情</div>
        <div class="hover-row"><strong>耗时:</strong> {{ (currentRecipe.TimeSpend / 60).toFixed(1) }} 秒</div>
        <div class="hover-row"><strong>产出:</strong> {{ recipeStore.getItemName(currentRecipe.Results[0]) }} × {{ currentRecipe.ResultCounts[0] }}</div>
        <div class="hover-divider"></div>
        <div class="hover-row"><strong>输入材料:</strong></div>
        <ul class="hover-list">
          <li v-for="(inputId, idx) in currentRecipe.Items" :key="idx">
            {{ recipeStore.getItemName(inputId) }} × {{ currentRecipe.ItemCounts[idx] }}
          </li>
        </ul>
        <div class="hover-divider"></div>
        <div class="hover-row"><strong>可用建筑:</strong> {{ availableBuildings.map(b => b.Name).join(', ') || '无' }}</div>
      </div>
    </el-popover>

    <!-- 递归子节点 -->
    <div class="tree-children" v-if="node.children && node.children.length">
      <RecipeTreeNode v-for="(child, idx) in node.children" :key="idx" :node="child" />
    </div>
  </div>
</template>

<style scoped>
/* 核心布局：通过 border-left 来画连线，解决连线断裂问题 */
.tree-node-wrapper {
  position: relative;
  padding-left: 24px; 
  margin-bottom: 6px;
}
.tree-node-wrapper:not(.is-child) { padding-left: 0; }

/* 连接线：使用左侧边框 */
.is-child::before {
  content: '';
  position: absolute;
  left: 12px;
  top: -6px;
  bottom: 0;
  border-left: 2px solid var(--border-color);
}
/* 横向连线 */
.is-child::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 20px; /* 节点中心位置 */
  width: 12px;
  border-top: 2px solid var(--border-color);
}
/* 最后一个子节点，连接线缩短 */
.tree-children > .is-child:last-child::before { bottom: 50%; }

/* 节点内容布局 */
.tree-node-content {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 6px 12px;
  font-family: monospace;
  font-size: 13px;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  cursor: pointer;
  transition: all 0.2s;
}
.tree-node-content:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.15);
}

.tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.raw { background-color: #fdf6ec; color: #e6a23c; border: 1px solid #f5dab1; }
.circular { background-color: #fef0f0; color: #f56c6c; border: 1px solid #fbc4c4; }
.item-name { color: var(--text-main); font-weight: bold; font-size: 14px; }
.qty { color: var(--text-sub); }

/* 靠拢的需求与建筑信息 */
.detail-box { display: flex; gap: 4px; font-size: 12px; }
.detail-item { padding: 2px 6px; border-radius: 4px; }
.demand { background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff; }
.building { background: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8; font-weight: bold; }

.mini-select { padding: 2px 4px; font-size: 11px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-main); outline: none; cursor: pointer; }
.building-select { color: #e6a23c; background: #fdf6ec; border-color: #f5dab1; }

/* 悬停浮窗样式 */
.hover-card { padding: 10px; font-size: 13px; color: var(--text-main); }
.hover-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; }
.hover-row { margin-bottom: 6px; display: flex; gap: 6px; }
.hover-divider { height: 1px; background: var(--border-color); margin: 8px 0; }
.hover-list { margin: 0; padding-left: 20px; color: #409eff; }
.hover-list li { margin-bottom: 4px; }
</style>