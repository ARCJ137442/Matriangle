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

function getWSLinkScreen() { return `ws://${screenAddress.value}` }
let socketControl;

// 网络
const resetButton = document.getElementById('reset');

// 重置网络
function resetAllWS() {
	// 控制
	socketControl?.close()
	socketControl = new WebSocket(getWSLinkControl())
	// 屏显
	resetScreenWS();
}
function resetScreenWS() {
	// 屏显
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
				} catch (e) {
					console.error('消息发送失败:', e)
				}
			}, calculateFPS())
		}
		// 收到母体信号时
		socketScreen.onmessage = (event) => {
			// console.info('data:', event.data.toString())
			setScreen(event.data.toString())
		}
		// 关闭时
		socketScreen.onclose = (event) => {
			console.info('屏显WS已关闭:', event);
			// 不用关闭时钟，直接等待输入
		}
		// 报错时
		socketScreen.onerror = (event) => {
			console.error('屏显WS出错:', event)
			console.error('三秒后尝试重新连接。。。')
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
