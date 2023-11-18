<!-- 用于旧有「纯文本显示」的功能 -->
<template>
	<!-- 文本屏显 -->
	<p class="screenText">{{ screenText }}</p>
	<!-- 附加信息 -->
	<p class="otherInfText">{{ otherInfText }}</p>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import { VisualizationOutputMessagePrefix } from 'matriangle-mod-visualization/logic/abstractVisualization.type'

// 变量引用
/** 屏显文本 */
const screenText: Ref<string> = ref('屏显：无信号。。。')
/** 「附加信息」文本 */
const otherInfText: Ref<string> = ref('附加信息：无信号。。。')

// 注册方法
defineExpose({
	/**
	 * 根据数据更新
	 *
	 * @param {[VisualizationOutputMessagePrefix, string] | null} data 数据
	 */
	update(data: [VisualizationOutputMessagePrefix, string] | null): void {
		if (data === null) return
		// 非空
		switch (data[0]) {
			// * 附加信息
			case VisualizationOutputMessagePrefix.OTHER_INFORMATION:
				otherInfText.value = data[1]
				break
			// * 其它⇒都等同于「文本」
			case VisualizationOutputMessagePrefix.TEXT:
				screenText.value = data[1]
				break
			default:
				console.warn('未知的消息类型！', data)
				screenText.value = data[1]
		}
	},
})
</script>

<style scoped>
/* 屏显 */
.screenText {
	/* 保留空格 */
	white-space: pre;
	/* 等宽字体 */
	font-family: Consolas, Monaco, 'Courier New', monospace;
	font-size: smaller;
}

/* 附加信息 */
.otherInfText {
	/* 保留空格 */
	white-space: pre;
	/* 字体 */
	font-family: Consolas, Monaco, 'Courier New', monospace;
	font-size: medium;
	font-weight: inherit;
}
</style>
