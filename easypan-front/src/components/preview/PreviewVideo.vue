<template>
  <div ref="player" id="player">

  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue"
import DPlayer from 'dplayer';
const { proxy } = getCurrentInstance();

const props = defineProps({
    url: {
        type: String,
    }
});
const videoInfo = ref({
    video: null
});

const player = ref();

const initPlayer = () => {
    const dp = new DPlayer({
        element: player.value,
        theme: '#BFBBB4',
        screenshot: true,
        video: {
            url: `/api/${props.url}`,
            type: "customHls",
            customType: {
                customHls: function(video, player) {
                    const hls = new Hls();
                    hls.loadSource(video.src);
                    hls.attachMedia(video);
                }
            }
        }
    });
}

onMounted(() => {
    initPlayer();
    console.log(props.url);
    
});
</script>

<style lang="scss" scoped>

</style>
