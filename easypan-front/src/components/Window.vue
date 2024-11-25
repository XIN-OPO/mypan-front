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
.window {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .window-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9998;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(1px);
        pointer-events: auto;
    }

    .close {
        position: fixed;
        top: 40px;
        right: 30px;
        width: 44px;
        height: 44px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.4);
            transform: rotate(90deg);
        }

        .icon-font {
            font-size: 20px;
            color: #fff;
        }
    }

    .window-content {
        position: relative;
        z-index: 9999;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        max-width: 90%;
        max-height: 95vh;
        pointer-events: auto;
        animation: modalFadeIn 0.3s ease;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .title {
            padding: 16px 24px;
            text-align: center;
            line-height: 24px;
            font-size: 16px;
            font-weight: 600;
            color: #333;
            border-bottom: 1px solid #ebeef5;
            background: #fff;
            border-radius: 12px 12px 0 0;
            flex-shrink: 0;
        }

        .content-body {
            padding: 16px;
            flex: 1;
            min-height: 100px;
            max-height: calc(95vh - 57px);
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            scrollbar-gutter: stable;

            video {
                max-height: calc(95vh - 89px);
                width: auto;
                object-fit: contain;
                vertical-align: middle;
            }
        }
    }
}
</style>
