pp<!--
 数据面板
 * 用于呈现数据图表，并对接主体消息服务
 TODO: 面对多个智能体时，可能需要实现「多图表服务」
 -->
<template>
	<!-- * 信息：有关实验本身的信息 * -->
	<div v-show="textInfo.length > 0">
		<p @click="infoVisible = !infoVisible" class="sub-title">
			信息（{{ infoVisible ? '点击折叠' : '点击展开' }}）：
		</p>
		<!-- ! 下面实现「点击展开/合并」的效果 -->
		<p class="text">
			{{ infoVisible ? textInfo : textInfo.slice(0, 20) + '……' }}
		</p>
	</div>
	<!-- * 图表 * -->
	<div>
		<p class="sub-title">图表：</p>
		<!-- * ↓这里反转变量无需使用`.value` * -->
		<button
			type="button"
			@click="plotVisible = !plotVisible"
			@vue:mounted="init"
		>
			{{ plotVisible ? '点击折叠图表' : '点击展开图表' }}（{{
				isConnected ? '已连接' : '未连接'
			}}）
		</button>
		<div>
			<!-- TODO: 控制图表数量 -->
			<!-- * 这里使用`v-show`控制图表的展开与折叠 * -->
			<input
				v-show="false"
				type="text"
				v-model="numPlotsText"
				placeholder="输入图表数量"
				@keydown="
					(e: KeyboardEvent): false | void =>
						e.key === 'Enter' && onAddressChange()
				"
			/>
			<!-- 各个图表 -->
			<div>
				<input
					v-show="plotVisible"
					type="text"
					v-model="dataShowAddress"
					placeholder="输入链接"
					@keydown="
						(e: KeyboardEvent): false | void =>
							e.key === 'Enter' && onAddressChange()
					"
				/>
				<Plot v-show="plotVisible" ref="plot" @vue:mounted="plotInit" />
			</div>
		</div>
	</div>
	<!-- * 文本 * -->
	<div v-show="textData.length > 0">
		<p @click="textVisible = !textVisible" class="sub-title">
			文本（{{ textVisible ? '点击折叠' : '点击展开' }}）：
		</p>
		<p class="text">
			{{ textVisible ? textData : textData.slice(0, 20) + '……' }}
		</p>
	</div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import Plot from './Plot.vue'
import { VueElementRefNullable } from '../lib/common'
import { IsXYData } from '../lib/plot'

// 配置常量 //
/** 「数据显示服务」服务地址 */
const dataShowAddress: Ref<string> = ref('127.0.0.1:3030')
let _lastAddress: string = dataShowAddress.value
const HEART_BEAT_INTERVAL = 3000 // ! 太快的连接会导致频繁重连，发生连不上的情况

// 子组件 //
/** 实验自身的信息 */
const textInfo: Ref<string> = ref('')
const infoVisible: Ref<boolean> = ref(true)
/** 作为文本显示的数据 */
const textData: Ref<string> = ref('')
const textVisible: Ref<boolean> = ref(true)
/** 作为图表显示的数据 */
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
const numPlotsText: Ref<string> = ref('1')
/**
 * 存储内部「是否已连接」的状态
 */
const isConnected: Ref<boolean> = ref(false)

// 事件 //
const emit = defineEmits(['link-start', 'link-change', 'message-request'])

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
		(message: string): void => onReceiveMessage(plot, message),
		/** 连接打开后 */
		(): void => {
			// 更新连接状态
			isConnected.value = true
		},
		/** 关闭连接后 */
		(): void => {
			// 更新连接状态
			isConnected.value = false
			// 自动隐藏图表
			plotVisible.value = false
		}
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
function onReceiveMessage(
	plot: VueElementRefNullable<typeof Plot>,
	message: string
): void {
	// 空消息⇒不理
	if (message.length === 0) return
	// 以「头字符」作为「更新指令」
	switch (message[0]) {
		// 以`{`开头的JSON数据⇒更新图表
		case '{':
			// 检查图表元素是否存在
			if (plot.value === null || plot.value.isInited === undefined)
				return console.error('图表元素不存在！')
			// 从消息更新图表
			updatePlotFromMessage(plot.value, message)
			break
		// 以`|`开头的文本⇒覆盖文本数据
		case '|':
			textData.value = message.slice(1)
			break
		// 以`+`开头的文本⇒追加文本数据
		case '+':
			textData.value += message.slice(1)
			break
		// 以`i`开头的文本⇒设定实验信息
		case 'i':
			textInfo.value = message.slice(1)
			break
		// 否则⇒不理
		default:
			break
	}
}

/** 图表更新 */
function updatePlotFromMessage(
	plot: InstanceType<typeof Plot>,
	message: string
): void {
	// 解析数据 // ! 不论是否有
	const data = JSON.parse(message)
	// console.log('数据面板 数据：', data)
	// 若为「更新用数据」
	console.debug('数据面板 数据：', data, IsXYData(data), plot.isInited())

	if (IsXYData(data)) {
		// 只有在「已初始化」后更新数据
		if (plot.isInited()) {
			// 图表未显示⇒自动打开
			plotVisible.value = true
			// 更新图表数据
			plot.append(
				// !【2023-10-30 15:30:08】现在仍使用解析后的JS对象
				data
			)
		}
	}
	// 否则⇒重置配置（无论有无初始化）
	else plot.reset(data)

	// 图表未初始化⇒缓存数据，请求重置
	if (!plot.isInited()) {
		// 缓存数据
		console.log(`缓存数据[${_temp_cached_received_data.length}]：`, message)
		_temp_cached_received_data.push(message)
		// 请求重置 & 更新实验信息
		requestConfig()
		requestInfo()
	}
	// 若有缓存数据⇒使用缓存数据，清除缓存 // ! 不要提前使用缓存了！即便顺序会不一致！在直连服务里会导致「无限递归」问题！
	else if (_temp_cached_received_data.length > 0) {
		// ! 测试用
		if (_temp_cached_received_data.length > 0x10)
			return console.error(
				'缓存数据过多，可能意味着连接存在问题！',
				_temp_cached_received_data,
				plot.isInited
			)
		console.log('使用缓存：', _temp_cached_received_data[0])
		// 发送消息，并清除最先发送的（实质上是「先进先出」队列）
		updatePlotFromMessage(plot, _temp_cached_received_data.shift()!) // 因为这里要递归，所以需要独立定义函数
	}
}
let _temp_cached_received_data: string[] = []

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
	emit('message-request', dataShowAddress.value, 'request-config')
}
/**
 * 请求获得「实验信息」
 *
 * ! 回调发生在上面的「消息回调」中
 */
function requestInfo(): void {
	emit('message-request', dataShowAddress.value, 'request-info')
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

/* 小标题 */
.sub-title {
	font-weight: bold;
	font-size: larger;
}

/* 附加信息 */
.text {
	/* 保留空格、自动换行 */
	white-space: pre-wrap;
	/* 字体 */
	font-family: Consolas, Monaco, 'Courier New', monospace;
	font-size: medium;
	font-weight: inherit;
}
</style>
