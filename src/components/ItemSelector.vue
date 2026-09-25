<script setup>
import { computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const props = defineProps({
  modelValue: { type: Number, default: null },
  type: { type: String, default: 'item' } // 'item' 或 'building'
});
const emit = defineEmits(['update:modelValue']);

const options = computed(() => {
  const all = Object.values(recipeStore.items);
  const filtered = props.type === 'building' 
    ? all.filter(i => i.Type === 4 || i.Name.includes('制造台') || i.Name.includes('熔炉') || i.Name.includes('化工厂'))
    : all.filter(i => i.Type !== 4);
  return filtered.map(i => ({ value: i.ID, label: i.Name }));
});

const placeholder = computed(() => props.type === 'building' ? '搜索建筑...' : '搜索物品...');
</script>

<template>
  <el-select :model-value="modelValue" filterable clearable :placeholder="placeholder" style="width: 200px;" @change="val => emit('update:modelValue', val)">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>