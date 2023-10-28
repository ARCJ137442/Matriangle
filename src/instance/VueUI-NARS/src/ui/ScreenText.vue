<!-- 用于旧有「纯文本显示」的功能 -->
<template>
	<!-- 文本屏显 -->
	<p class="screenText">{{ screenText }}</p>
	<!-- 附加信息 -->
	<p class="otherInfText">{{ otherInfText }}</p>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'

// 类型定义
type TextDisplayData = {
	screen?: string
	otherInf?: string
}

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
	 * @param data 数据
	 */
	update(data: TextDisplayData): void {
		if (data?.screen !== undefined) screenText.value = data.screen
		if (data?.otherInf !== undefined) otherInfText.value = data.otherInf
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
