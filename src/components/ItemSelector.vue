<script setup>
import { ref, computed } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';

const recipeStore = useRecipeStore();
const keyword = ref('');
const isOpen = ref(false);

// 根据输入的关键词过滤物品
const filteredItems = computed(() => {
  if (!keyword.value) return Object.values(recipeStore.items);
  const lower = keyword.value.toLowerCase();
  return Object.values(recipeStore.items).filter(item =>
    item.Name.toLowerCase().includes(lower)
  );
});

const props = defineProps({
  modelValue: { type: Number, default: null }
});
const emit = defineEmits(['update:modelValue']);

// 选中物品
function selectItem(itemId) {
  emit('update:modelValue', itemId);
  keyword.value = recipeStore.getItemName(itemId);
  isOpen.value = false;
}
</script>

<template>
  <div class="selector-wrapper">
    <input
      type="text"
      v-model="keyword"
      @focus="isOpen = true"
      placeholder="搜索物品（如：电路板）"
      class="search-input"
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
.search-input {
  width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;
  box-sizing: border-box;
}
.dropdown {
  position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd;
  border-radius: 4px; max-height: 200px; overflow-y: auto; margin: 4px 0 0; padding: 0;
  list-style: none; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.dropdown li {
  padding: 8px 12px; cursor: pointer; font-size: 14px; color: #2c3e50;
}
.dropdown li:hover { background-color: #f0f4f8; }
.overlay { position: fixed; inset: 0; z-index: 5; }
</style>