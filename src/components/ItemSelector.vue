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
  // 使用 Number() 强制转换 Type，防止字符串类型导致过滤失败
  const filtered = props.type === 'building' 
    ? all.filter(i => Number(i.Type) === 4 || i.Name.includes('制造台') || i.Name.includes('熔炉') || i.Name.includes('化工厂'))
    : all.filter(i => Number(i.Type) !== 4 && !i.Name.includes('制造台') && !i.Name.includes('熔炉') && !i.Name.includes('化工厂'));
  return filtered.map(i => ({ value: i.ID, label: i.Name }));
});

const placeholder = computed(() => props.type === 'building' ? '搜索建筑...' : '搜索物品...');
</script>

<template>
  <!-- 添加 teleported 属性，防止下拉菜单被卡片裁剪 -->
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