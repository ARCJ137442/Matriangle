// 控制
const controlAddress = document.getElementById('controlAddress');
const controlKey = document.getElementById('controlKey');
const controlMessage = document.getElementById('controlMessage');

function getWSLinkControl() { return `ws://${controlAddress.value}` }
let socketScreen;

// 屏显
const screenAddress = document.getElementById('screenAddress');
const screenFPS = document.getElementById('screenFPS');
const displayCode = document.getElementById('displayCode');
let screenIntervalID;
const calculateFPS = () => 1000 / parseFloat(screenFPS.value);
let FPS = calculateFPS();
const screenText = document.getElementById('screen');
const otherInfText = document.getElementById('otherInf');

function getWSLinkScreen() { return `ws://${screenAddress.value}` }
let socketControl;

// 网络
const resetButton = document.getElementById('reset');
const otherInfMessage = 'entities'

const isEntityListSignal = (text) => text.startsWith('实体列表')

/**
 * 重置网络
 * 
 * @param {boolean} force 是否强制
 */
function resetAllWS(force = true/* 默认为真，留给侦听器直接调用 */) {
	// 控制
	resetControlWS(force);
	// 屏显
	resetScreenWS(force);
}
/**
 * 重置控制
 * 
 * @param {boolean} force 是否强制
 */
function resetControlWS(force = false) {
	socketControl?.close()
	socketControl = new WebSocket(getWSLinkControl())
	if (socketControl) {
		socketControl.onopen = (event) => {
			console.info('控制WS连接成功！', event)
		}
		socketControl.onclose = (event) => {
			console.info('控制WS已断线！', event)
		}
		socketControl.onerror = (event) => {
			console.warn('控制WS出错！', event)
		}
	}
}
/** 重连的倒计时ID（避免多个timeout刷请求） */
let reconnectScreenTimeoutID = { value: undefined };
/**
 * 不冲突地设定timeout
 * @param {{value:number|undefined}} id 
 */
const softSetTimeout = (id, callback, delay, ...args) => {
	return (
		id.value === undefined ?
			id.value = setTimeout((...args) => { callback(...args); id.value = undefined }, delay, ...args) :
			undefined
	)
}
/**
 * 重置屏显
 * 
 * @param {boolean} force 是否强制
 */
function resetScreenWS(force = false/* 默认为假，留给「自动重连」调用 */) {
	// 非强制&还在开⇒不要重置
	if (!force && socketScreen.readyState === WebSocket.OPEN) return;
	socketScreen?.close()
	socketScreen = new WebSocket(getWSLinkScreen())
	if (socketScreen) {
		// 收发消息
		socketScreen.onopen = (event) => {
			console.info('屏显WS已打开，信号已接入:', event);

			// 连接成功⇒设置屏显时钟
			FPS = calculateFPS();
			if (screenIntervalID) {
				clearInterval(screenIntervalID)
				screenIntervalID = undefined;
			}
			screenIntervalID = setInterval(() => {
				// console.info('signal sent:', socketScreen, 'matrix')
				try {
					// 尝试发送消息
					/* if (displayCode.value[0] === ' ')
						// 前导空格⇒以所操控玩家为中心，进行「所有截面展示」
						sendMessage(socketScreen, `player${displayCode.value.slice(1)}@${}`)
					else */
					sendMessage(socketScreen, displayCode.value);
					// 独立发送「获取实体列表」
					sendMessage(socketScreen, otherInfMessage);
				} catch (e) {
					console.error('消息发送失败:', e)
				}
			}, calculateFPS())
		}
		// 收到母体信号时
		socketScreen.onmessage = (event) => {
			// console.info('data:', event.data.toString())
			let dataS = event.data.toString();
			if (isEntityListSignal(dataS))
				setOtherInf(dataS)
			else
				setScreen(dataS)
		}
		// 关闭时
		socketScreen.onclose = (event) => {
			console.info('屏显WS已关闭:', event);
			// 不用关闭时钟，直接等待重连
			if (softSetTimeout(reconnectScreenTimeoutID, resetScreenWS, 5000))
				console.info('五秒后尝试重新连接。。。')
		}
		// 报错时
		socketScreen.onerror = (event) => {
			console.warn('屏显WS出错:', event)
			if (softSetTimeout(reconnectScreenTimeoutID, resetScreenWS, 3000))
				console.info('三秒后尝试重新连接。。。')
		}
	}
}
// 重置⇒刷新配置
resetAllWS(true);

// 控制器 //

const pressed = {}
/**
 * 根据键位获取「动作信息」
 * 
 * @param {KeyboardEvent} event 键盘事件
 * @param {boolean} isDown 是否按下
 * @returns WS信息
 */
function getControlMessage(event, isDown) {
	if (!(event.code in pressed)) console.log(event);
	pressed[event.code] = event;
	let action = getActionFromEvent(event, isDown);
	if (action === undefined) return undefined;
	// 生成套接字消息
	return `${controlKey.value}|${action}`
}

/**
 * 根据键盘事件返回「玩家行动」
 * 
 * TODO: 这些代码计划内迁入TS中，变成原先AS3那样可配置的一部分
 * 
 * @param {KeyboardEvent} keyboardEvent 键盘事件
 * @param {boolean} isDown 是否按下
 * @returns 对应的「玩家行动」值
 */
function getActionFromEvent(keyboardEvent, isDown) {
	switch (keyboardEvent.code) {
		// X
		case 'KeyA':
		case 'ArrowLeft':
			return isDown ? -2 : undefined; // 只有按下时才响应
		case 'KeyD':
		case 'ArrowRight':
			return isDown ? -1 : undefined; // 只有按下时才响应
		// Y
		case 'KeyW':
		case 'ArrowUp':
			return isDown ? -4 : undefined; // 只有按下时才响应
		case 'KeyS':
		case 'ArrowDown':
			return isDown ? -3 : undefined; // 只有按下时才响应
		// Z
		case 'KeyQ':
			return isDown ? -6 : undefined; // 只有按下时才响应
		case 'KeyE':
			return isDown ? -5 : undefined; // 只有按下时才响应
		// W
		case 'KeyZ':
			return isDown ? -8 : undefined; // 只有按下时才响应
		case 'KeyC':
			return isDown ? -7 : undefined; // 只有按下时才响应
		// 用
		case 'Space':
			return isDown ? 'startUsing' : 'stopUsing';
	}
}

/**
 * 键盘按下
 * @param {KeyboardEvent} event 键盘事件
 */
function onKeyDown(event) {
	// 产生消息
	let message = getControlMessage(event, true);
	if (message === undefined) return;
	if (controlMessage) controlMessage.innerText = `↓ message = ${message}`
	// 阻止默认操作（不会造成画面滚动）
	event.preventDefault();
	// 断线⇒尝试重连
	if (!socketControl || socketControl.readyState === WebSocket.CLOSED) {
		console.warn('控制WS断线。尝试重新连接。。。')
		resetControlWS()
		return;
	}
	// 发送请求
	sendMessage(socketControl, message);
}
/**
 * 键盘释放
 * @param {KeyboardEvent} event 键盘事件
 */
function onKeyUp(event) {
	// 产生消息
	let message = getControlMessage(event, false);
	if (message === undefined) return;
	if (controlMessage) controlMessage.innerText = `↑ message = ${message}`
	// 阻止默认操作（不会造成画面滚动）
	event.preventDefault();
	// 断线⇒尝试重连
	if (!socketControl || socketControl.readyState === WebSocket.CLOSED) {
		console.warn('控制WS断线。尝试重新连接。。。')
		resetControlWS()
		return;
	}
	// 发送请求
	sendMessage(socketControl, message);
}

/**
 * 向WS发送消息
 * 
 * * 只在状态为「打开」时发送消息
 * @param {KeyboardEvent} event 键盘事件
 */
function sendMessage(socket, message) {
	if (socket instanceof WebSocket && socket.readyState === WebSocket.OPEN)
		socket.send(message)
}

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
resetButton.addEventListener('click', resetAllWS)

// 显示器 //

/**
 * 刷新画面
 * 
 * @param {Element} text 文本元素
 */
function setScreen(text) {
	// console.log('signal received:', text)
	screenText.innerText = text;
}

/**
 * 刷新其它信息（实体列表）
 * 
 * @param {Element} text 文本元素
 */
function setOtherInf(text) {
	otherInfText.innerText = text
}
