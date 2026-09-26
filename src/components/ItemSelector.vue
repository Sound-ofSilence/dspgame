<script setup>
import { computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const props = defineProps({
  modelValue: { type: Number, default: null },
  type: { type: String, default: 'item' }
});
const emit = defineEmits(['update:modelValue']);

const options = computed(() => {
  const all = Object.values(recipeStore.items);
  // 使用精准的 Category 字段进行过滤
  const filtered = props.type === 'building' 
    ? all.filter(i => i.Category === 'building')
    : all.filter(i => i.Category === 'item');
  return filtered.map(i => ({ value: i.ID, label: i.Name }));
});

const placeholder = computed(() => props.type === 'building' ? '搜索建筑...' : '搜索物品...');
</script>

<template>
  <el-select 
    :model-value="modelValue" 
    filterable 
    clearable 
    teleported
    :placeholder="placeholder" 
    style="width: 220px;" 
    @change="val => emit('update:modelValue', val)"
  >
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>