<script setup>
import { computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';
import { usePlanStore } from '../stores/planStore';

// 直接使用 defineOptions 宏，无需 import
defineOptions({ name: 'RecipeTreeNode' });

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
});

const recipeStore = useRecipeStore();
const planStore = usePlanStore();

const itemName = computed(() => recipeStore.getItemName(props.node.itemId));
const indent = computed(() => props.depth * 24 + 'px');

// 获取该物品所有的可用配方
const availableRecipes = computed(() => {
  if (props.node.isRaw || !props.node.itemId) return [];
  return recipeStore.recipesByResult[props.node.itemId] || [];
});

// 下拉框切换事件
function onRecipeChange(event) {
  const newRecipeId = Number(event.target.value);
  planStore.selectRecipe(props.node.itemId, newRecipeId);
  planStore.calculate(); // 立即重新计算
}
</script>

<template>
  <div class="tree-node" :style="{ paddingLeft: indent }">
    <span v-if="node.isRaw" class="tag raw">原矿</span>
    <span v-else-if="node.isCircular" class="tag circular">循环依赖</span>
    <span class="item-name">{{ itemName }}</span>
    <span v-if="node.qtyPerCraft" class="qty">×{{ node.qtyPerCraft }}</span>

    <!-- 如果存在多个配方，显示下拉选择框 -->
    <select
      v-if="availableRecipes.length > 1"
      :value="node.recipeId"
      @change="onRecipeChange"
      class="recipe-select"
    >
      <option v-for="r in availableRecipes" :key="r.ID" :value="r.ID">
        {{ r.Name || ('路线 ' + r.ID) }}
      </option>
    </select>

    <!-- 递归渲染子节点 -->
    <div v-for="(child, idx) in node.children" :key="idx">
      <RecipeTreeNode :node="child" :depth="depth + 1" />
    </div>
  </div>
</template>

<style scoped>
.tree-node { line-height: 2.2; font-family: monospace; font-size: 14px; }
.tag { font-size: 12px; padding: 1px 6px; border-radius: 4px; margin-right: 8px; }
.raw { background-color: #fff8e1; color: #e67e22; border: 1px solid #ffe082; }
.circular { background-color: #ffebee; color: #e53935; border: 1px solid #ef9a9a; }
.item-name { color: #2c3e50; font-weight: bold; }
.qty { color: #7f8c8d; margin-left: 6px; }

.recipe-select {
  margin-left: 10px;
  padding: 2px 6px;
  font-size: 12px;
  border: 1px solid #c0c4cc; /* 更清晰的边框 */
  border-radius: 4px;
  background: #ffffff;        /* 强制白色背景 */
  color: #303133;             /* 黑色文字，方便阅读 */
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}
.recipe-select:hover { border-color: #409eff; color: #409eff; }
</style>