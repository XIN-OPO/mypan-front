<template>
  <div class="window" v-if="show"> 
    <div class="window-mask" @click="closeWindow" v-if="show">

    </div>
    <div class="close" @click="closeWindow" v-if="show">
        <span class="iconfont icon-close2"></span>
    </div>
    <div class="window-content" :style="{top:'0px',left:windowContentLeft+'px',width:windowContentWidth+'px'}">
        <div class="title">{{title}}</div>
        <div class="content-body" :style="'align-items:'+align">
            <slot></slot>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted } from "vue"
const { proxy } = getCurrentInstance();

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    width: {
        type: Number,
        default: 800
    },
    title: {
        type: String,
        default: ''
    },
    align: {
        type: String,
        default: 'top'
    },
});

const windowWidth = ref(window.innerWidth);
const windowContentWidth = computed(() => {
    return props.width > windowWidth.value ? windowWidth.value : props.width;
});
const windowContentLeft = computed(() => {
    let left = (windowWidth.value - windowContentWidth.value) / 2;
    return left > 0 ? left : 0;
});

const emit = defineEmits(['close']);

const closeWindow = () => {
    emit('close');
}

const resizeWindow = () => {
    windowWidth.value = window.innerWidth;
}   
onMounted(() => {
    window.addEventListener('resize', resizeWindow);
});

defineExpose({
    closeWindow
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeWindow);
});

</script>

<style lang="scss" scoped>
.window{
    .window-mask{
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 200;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0.5;
        position: fixed;
    }
    .close{
        z-index: 202;
        cursor: pointer;
        position: absolute;
        top:40px;
        right:30px;
        width: 44px;
        height: 44px;
        background:#606266;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon-font{
            font-size: 20px;
            color: #fff;
            z-index: 10000;
        }
    }
    .window-content{
        z-index: 201;
        position: absolute;
        top: 0;
        left: 0;
        background: #fff;
        .title{
            text-align: center;
            line-height: 40px;
            border-bottom: 1px solid #e4e7ed;
            font-weight:bold;
        }
        .content-body{
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;   
        }
    }
}
</style>
