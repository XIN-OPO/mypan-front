<template>
    <div ref="player" id="player"></div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import DPlayer from "dplayer";
import Hls from "hls.js";

// 接收外部传入的 `url` 参数
const props = defineProps({
    url: {
        type: String,
    }
});

const player = ref();

// 初始化播放器
const initPlayer = () => {
    const dp = new DPlayer({
        element: player.value,
        theme: '#BFBBB4',
        screenshot: true,
        video: {
            url: `/api/${props.url}`,
            type: 'customHls', // 使用自定义 HLS 类型
            customType: {
                customHls: function (video, player) {
                    // 初始化 Hls.js
                    const hls = new Hls({
                        enableWorker: true,
                        startLevel: -1,
                        autoStartLoad: true,
                        capLevelToPlayerSize: true,
                        maxBufferLength: 15,  // 缓冲区最大长度，设置为较小的值来减少内存占用
                        maxBufferSize: 10 * 1024 * 1024,  // 缓冲区最大大小，10MB
                        maxMaxBufferLength: 30,  // 最大缓冲分片数
                        liveSyncDuration: 10,
                        liveMaxLatencyDuration: 15,
                        manifestLoadingTimeOut: 10000,
                        levelLoadingTimeOut: 10000,
                        startFragPrefetch: false,  // 关闭自动预加载
                        audioTrackSwitching: true,
                        audioTrackEnabled: true,
                        maxBufferHole: 0.5  // 防止缓冲空洞过大
                    });

                    // 加载视频源并绑定到视频元素
                    hls.loadSource(video.src);
                    hls.attachMedia(video);

                    // 监听 FRAG_LOADING 事件，调试是否重复请求第一个分片
                    hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
                        console.log('正在加载分片:', data.frag.sn);
                    });

                    // 监听分片播放完成，确保按顺序加载下一个分片
                    hls.on(Hls.Events.FRAG_PARSING_COMPLETE, (event, data) => {
                        console.log('当前分片播放完成:', data.frag.sn);

                        // 当一个分片播放完成后，手动触发下一个分片加载
                        if (hls.buffered.length > 0) {
                            const nextFrag = hls.startPosition + 1;
                            hls.loadNextFragment(nextFrag);
                        }
                    }); 

                    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
                        console.log("分片加载完成:", data.frag.sn);
                        // 每次分片加载完成时，可以做一些控制，如检查是否需要加载下一个分片
                        if (hlsInstance.buffered.length > 0) {
                            const bufferEnd = hlsInstance.buffered.end(hlsInstance.buffered.length - 1);
                            const videoDuration = video.duration;
                            if (bufferEnd < videoDuration - 5) {
                                hlsInstance.startLoad(); // 加载下一个分片
                            }
                        }
                    });

                    // 监听视频播放结束时加载下一个分片
                    video.onended = () => {
                        console.log('当前分片播放完成，加载下一个分片');
                        hls.startLoad();
                    };
                }
            }
        }
    });

    // 视频准备好后播放
    dp.video.oncanplay = () => {
        dp.play();
    };
}

// 挂载时初始化播放器
onMounted(() => {
    initPlayer();
});
</script>

<style lang="scss" scoped>
#player {
    width: 100%;
    height: 100%;

    :deep(.dplayer) {
        width: 100%;
        height: 100%;
    }

    :deep(.dplayer-video) {
        object-fit: contain;
    }
}
</style>


