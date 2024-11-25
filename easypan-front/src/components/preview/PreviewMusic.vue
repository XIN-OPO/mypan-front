<template>
    <div class="music">
        <div class="body-content">
            <div class="cover">
                <img src="@/assets/1013373.png" alt="">
            </div>
            <div class="music-player" ref="playerRef">

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import APlayer from "APlayer";
import "APlayer/dist/APlayer.min.css";

const props = defineProps({
    url: {
        type: String,
    },
    fileName: {
        type: String,
    }
});

const playerRef = ref();
const player = ref();

onMounted(() => {
    player.value = new APlayer({
        container: playerRef.value,
        audio: [{
            name: props.fileName,
            artist: '未知',
            url: `/api/${props.url}`,
            cover: new URL('@/assets/music_cover.png', import.meta.url).href,
        }],
        preload: 'auto',
        autoplay: false,
        theme: '#FADFA3',
        loop: 'all',
        order: 'list',
        volume: 0.7,
        mutex: true,
        listFolded: false,
        listMaxHeight: 90,
        lrcType: 0,
        fixed: false,
        mini: false,
    });
});

onUnmounted(() => {
    if (player.value) {
        player.value.destroy();
    }
});
</script>

<style lang="scss" scoped>
.music {
    width: 100%;
    min-width: 360px;
    padding: 20px;
    background: linear-gradient(135deg, #FF9A9E 0%, #F6416C 50%, #9B6BFF 100%);

    .body-content {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        text-align: center;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 20px;
        padding: 30px 20px;
        box-shadow: 0 15px 35px rgba(246, 65, 108, 0.2);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.7);
        animation: fadeIn 0.6s ease;

        .cover {
            width: 260px;
            height: 260px;
            margin: 0 auto 30px;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(155, 107, 255, 0.2);
            animation: bounceIn 0.6s ease;
            position: relative;
            background: linear-gradient(135deg, #FF9A9E 0%, #F6416C 100%);
            
            &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                background: #fff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                z-index: 2;
                box-shadow: 0 0 20px rgba(246, 65, 108, 0.3);
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                animation: rotate 20s linear infinite;
                transition: all 0.3s ease;
            }
        }

        .music-player {
            margin-top: 20px;
            animation: fadeIn 0.6s ease 0.3s both;

            :deep(.aplayer) {
                margin: 0;
                box-shadow: none;
                border: none;
                background: transparent;
                font-family: system-ui, -apple-system, sans-serif;

                .aplayer-info {
                    border: none;
                    padding: 15px;

                    .aplayer-music {
                        text-align: center;
                        padding: 0 0 15px 0;
                    }

                    .aplayer-controller {
                        .aplayer-bar-wrap {
                            margin: 0 0 15px 0;
                            padding: 5px 0;
                        }
                    }
                }
            }
        }
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 0.9;
        transform: scale(1.1);
    }
    80% {
        opacity: 1;
        transform: scale(0.89);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// 添加播放状态样式
:deep(.aplayer.aplayer-playing) {
    .cover img {
        animation-play-state: running;
    }
}

:deep(.aplayer:not(.aplayer-playing)) {
    .cover img {
        animation-play-state: paused;
    }
}
</style>
