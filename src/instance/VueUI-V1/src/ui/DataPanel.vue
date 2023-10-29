<template>
	<button @click="switchPlotVisible" @vue:mounted="init">
		{{ plotVisible ? '点击隐藏图表' : '点击显示图表' }}
	</button>
	<div>
		<input
			v-show="plotVisible"
			type="text"
			v-model="dataShowAddress"
			placeholder="输入链接"
			@keydown="
				(e: KeyboardEvent) => e.key === 'Enter' && onAddressChange()
			"
		/>
		<Plot v-show="plotVisible" ref="plot" @vue:mounted="plotInit" />
	</div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import Plot from './Plot.vue'
import { VueElementRefNullable } from '../lib/common'
import { IsXYData } from '../lib/plot'

// 配置常量 //
/** 「数据显示服务」服务地址 */ // TODO: 需要有一个「更新」函数
const dataShowAddress: Ref<string> = ref('127.0.0.1:3030')
let _lastAddress: string = dataShowAddress.value
const HEART_BEAT_INTERVAL = 3000 // ! 太快的连接会导致频繁重连，发生连不上的情况

// 子组件 //
const plot: VueElementRefNullable<typeof Plot> = ref(null)
/**
 * 切换图表显示状态
 *
 * !【2023-10-29 20:33:41】目前问题：若默认为否：
 * * 图表尺寸可能不正确（只有按钮的宽度）
 * * 图表可能没法正常接收更新
 * * 解决方案：初始化后在{@link init}方法内修改
 */
const plotVisible: Ref<boolean> = ref(true)

// 事件 //
const emit = defineEmits(['link-start', 'link-change', 'config-request'])

/** 组件初始化 */
function init(): void {
	// 发送「连接」请求
	emit(
		'link-start',
		/* 参数格式：
			address: string,
			heartbeatTimeMS: number,
			callbackMessage: MessageCallback,
			callbackConnected?: voidF,
			callbackStop?: voidF
			*/
		dataShowAddress.value,
		HEART_BEAT_INTERVAL,
		onReceiveMessage
	)
	// 初始化后隐藏图表
	plotVisible.value = false
}

/**
 * 地址变更事件
 * * 格式：(旧地址：string, 新地址：string)
 */
function onAddressChange(): void {
	emit(
		'link-change',
		// 旧地址
		_lastAddress,
		// 新地址
		dataShowAddress.value
	)
	// 更新旧地址
	_lastAddress = dataShowAddress.value
}

/** 消息回调函数：图表更新/重置 */
function onReceiveMessage(message: string): void {
	// 检查图表元素是否存在
	if (plot.value === null) return console.error('图表元素不存在！')
	// 若有缓存数据⇒使用缓存数据，清除缓存
	if (_temp_data.length > 0) {
		console.log('使用缓存：', _temp_data[0])
		onReceiveMessage(_temp_data.shift() as string)
	}
	// 解析数据 // ! 不论是否有
	const data = JSON.parse(message)
	// console.log('数据面板 数据：', data)
	// 若为「更新用数据」
	if (IsXYData(data)) {
		// 只有在「已初始化」后更新数据
		if (plot.value.isInited())
			plot.value.append(
				// 【2023-10-29 17:07:40】现在直接是纯JSON文本了
				data
			)
	}
	// 否则⇒重置配置（无论有无初始化）
	else plot.value.reset(data)

	// 图表未初始化⇒缓存数据，请求重置
	if (!plot.value.isInited()) {
		console.log('缓存数据：', message)
		_temp_data.push(message)
		requestConfig()
	}
}
let _temp_data: string[] = []

/** 图表初始化 */
function plotInit(): void {
	// 图表初始化
	plot.value?.init(null /* 用空数据初始化，后续配置会被发送过来填充 */)
}

/**
 * 请求获得「图表配置」
 *
 * ! 回调发生在上面的「消息回调」中
 */
function requestConfig(): void {
	emit('config-request', dataShowAddress.value, 'config-request')
}

function switchPlotVisible(): void {
	plotVisible.value = !plotVisible.value
}
</script>

<style scoped>
button {
	/* 宽度 */
	width: fit-content;
	/* 高度 */
	height: fit-content;
	/* 字体大小 */
	font-size: 20px;
	/* 内边距 */
	padding: 5px;
	/* 边框圆角 */
	border-radius: 10px;
}

/* 输入框样式 */
input[type='text'] {
	/* 输入框宽度 */
	width: 10%;
	min-width: 100px;
	/* 输入框高度 */
	height: 5%;
	min-height: 20px;
	/* 字体 */
	font-family: Arial, Helvetica, sans-serif;
	/* 字体大小 */
	font-size: 14px;
	/* 内边距 */
	padding: 5px;
	/* 边框样式 */
	border: 5px solid #ccc;
	/* 边框圆角 */
	border-radius: 4px;
}

/* 输入框的placeholder样式 */
input[type='text']::placeholder {
	color: #999;
	/* 文字颜色 */
}
</style>
