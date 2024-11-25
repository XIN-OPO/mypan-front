<template>
  <div class="image-previewer">
    
  </div>
  <el-image-viewer :initial-index="previewIndex" :url-list="imageList" hide-on-click-modal
  @close="closeImageViewer"
  v-if="previewIndex!=null"
  />
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();
const props = defineProps({
    imageList: {
     type: Array,
    }
});

const previewIndex = ref(null);
const showImageViewer = (index) => {
    stopScroll();
  previewIndex.value = index;
}
const closeImageViewer = () => {
    startScroll();
  previewIndex.value = null;
}
defineExpose({
  showImageViewer,
  closeImageViewer
});

const stopScroll = () => {
    document.body.style.overflow = "hidden";
}
const startScroll = () => {
    document.body.style.overflow = "auto";
}
</script>

<style lang="scss" scoped>
.el-image-viewer__mask{
    opacity: 0.7;
}

</style>
