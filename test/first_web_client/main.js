// 控制
const controlAddress = document.getElementById('controlAddress');
const controlKey = document.getElementById('controlKey');
const controlMessage = document.getElementById('controlMessage');

function getWSLinkControl() { return `ws://${controlAddress.value}` }
let socketScreen;

// 屏显
const screenAddress = document.getElementById('screenAddress');
const screenFPS = document.getElementById('screenFPS');
const blockWidth = document.getElementById('blockWidth');
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

// 重置网络
function resetAllWS() {
	// 控制
	resetControlWS();
	// 屏显
	resetScreenWS();
}
// 重置控制
function resetControlWS() {
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
// 重置屏显
function resetScreenWS() {
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
					sendMessage(socketScreen, blockWidth.value);
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
			console.info('五秒后尝试重新连接。。。')
			setTimeout(resetScreenWS, 5000)
		}
		// 报错时
		socketScreen.onerror = (event) => {
			console.warn('屏显WS出错:', event)
			console.info('三秒后尝试重新连接。。。')
			setTimeout(resetScreenWS, 3000)
		}
	}
}
// 重置⇒刷新配置
resetAllWS();

// 控制器 //

const pressed = {}
function getControlMessage(event, isDown) {
	// TODO: 根据键位获取动作
	if (!(event.code in pressed)) console.log(event);
	pressed[event.code] = event;
	let action = getActionFromEvent(event, isDown);
	if (action === undefined) return undefined;
	// 生成套接字消息
	return `${controlKey.value}|${action}`
}

function getActionFromEvent(keyboardEvent, isDown) {
	switch (keyboardEvent.code) {
		case 'KeyA':
		case 'ArrowLeft':
			return isDown ? -2 : undefined; // 只有按下时才响应
		case 'KeyD':
		case 'ArrowRight':
			return isDown ? -1 : undefined; // 只有按下时才响应
		case 'KeyW':
		case 'ArrowUp':
			return isDown ? -4 : undefined; // 只有按下时才响应
		case 'KeyS':
		case 'ArrowDown':
			return isDown ? -3 : undefined; // 只有按下时才响应
		case 'Space':
			return isDown ? 'startUsing' : 'stopUsing';
	}
}

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

// 只在状态为「打开」时发送消息
function sendMessage(socket, message) {
	if (socket instanceof WebSocket && socket.readyState === WebSocket.OPEN)
		socket.send(message)
}

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
resetButton.addEventListener('click', resetAllWS)

// 显示器 //

// 刷新画面

function setScreen(text) {
	// console.log('signal received:', text)
	screenText.innerText = text;
}

// 刷新其它信息（实体列表）
function setOtherInf(text) {
	otherInfText.innerText = text
}
