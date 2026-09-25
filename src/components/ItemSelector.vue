<script setup>
import { ref, computed, watch } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const keyword = ref('');
const isOpen = ref(false);

const props = defineProps({
  modelValue: { type: Number, default: null }
});
const emit = defineEmits(['update:modelValue']);

// 监听外部传入的 modelValue，实时同步显示文字
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    keyword.value = recipeStore.getItemName(newVal);
  }
}, { immediate: true });

// 过滤物品
const filteredItems = computed(() => {
  if (!keyword.value) return Object.values(recipeStore.items);
  const lower = keyword.value.toLowerCase();
  return Object.values(recipeStore.items).filter(item =>
    item.Name.toLowerCase().includes(lower)
  );
});

function selectItem(itemId) {
  const id = Number(itemId);
  emit('update:modelValue', id);
  keyword.value = recipeStore.getItemName(id);
  isOpen.value = false;
}
</script>

<template>
  <div class="selector-wrapper">
    <el-input
      v-model="keyword"
      placeholder="搜索物品..."
      @focus="isOpen = true"
      clearable
      style="width: 220px;"
    />
    <ul v-if="isOpen && filteredItems.length" class="dropdown">
      <li
        v-for="item in filteredItems.slice(0, 20)"
        :key="item.ID"
        @click="selectItem(item.ID)"
      >
        {{ item.Name }}
      </li>
    </ul>
    <div v-if="isOpen" class="overlay" @click="isOpen = false"></div>
  </div>
</template>

<style scoped>
.selector-wrapper { position: relative; width: 220px; }
.dropdown {
  position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd;
  border-radius: 4px; max-height: 200px; overflow-y: auto; margin: 4px 0 0; padding: 0;
  list-style: none; z-index: 999; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.dropdown li {
  padding: 8px 12px; cursor: pointer; font-size: 14px; color: #2c3e50;
}
.dropdown li:hover { background-color: #ecf5ff; color: #409eff; }
.overlay { position: fixed; inset: 0; z-index: 998; }
</style>