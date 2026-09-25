<script setup>
import { defineOptions, computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';

// 必须显式声明组件名，才能在模板里递归调用自己
defineOptions({ name: 'RecipeTreeNode' });

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
});

const recipeStore = useRecipeStore();
const itemName = computed(() => recipeStore.getItemName(props.node.itemId));
const indent = computed(() => props.depth * 24 + 'px');
</script>

<template>
  <div class="tree-node" :style="{ paddingLeft: indent }">
    <span v-if="node.isRaw" class="tag raw">原矿</span>
    <span v-else-if="node.isCircular" class="tag circular">循环依赖</span>
    <span class="item-name">{{ itemName }}</span>
    <span v-if="node.qtyPerCraft" class="qty">×{{ node.qtyPerCraft }}</span>

    <!-- 递归调用自己 -->
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
</style>