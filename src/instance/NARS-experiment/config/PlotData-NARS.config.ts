import { EChartsOption } from 'echarts'
const config: EChartsOption = {
	title: {
		text: '图表',
	},
	legend: {
		data: ['成功率', '自主成功率', '教学成功率', '激活率', '操作多样性'], // 直接是名字列表
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: [],
	},
	yAxis: {
		boundaryGap: [0, '50%'],
		type: 'value',
	},
	series: [
		{
			name: '成功率',
			type: 'line',
			smooth: true,
			symbol: 'none',
			color: '#66ccff',
			// stack: 'a',
			/* areaStyle: {
				normal: {}
			}, */ // 若有则代表面内填充
			// data: data // ! 后续设置
		},
		{
			name: '自主成功率',
			type: 'line',
			smooth: true,
			symbol: 'none',
			color: '#66ffcc',
			// stack: 'a',
			/* areaStyle: {
				normal: {}
			}, */ // 若有则代表面内填充
			// data: data // ! 后续设置
		},
		{
			name: '教学成功率',
			type: 'line',
			smooth: true,
			symbol: 'none',
			color: '#ffcc66',
			// stack: 'a',
			/* areaStyle: {
				normal: {}
			}, */ // 若有则代表面内填充
			// data: data // ! 后续设置
		},
		{
			name: '激活率',
			type: 'line',
			smooth: true,
			symbol: 'none',
			color: '#dd88dd',
			// stack: 'a',
			/* areaStyle: {
				normal: {}
			}, */ // 若有则代表面内填充
			// data: data2 // ! 后续设置
		},
		{
			name: '自主操作多样性',
			type: 'line',
			smooth: true,
			symbol: 'none',
			color: '#88dd88',
			// stack: 'a',
			/* areaStyle: {
				normal: {}
			}, */ // 若有则代表面内填充
			// data: data2 // ! 后续设置
		},
		{
			name: '教学操作多样性',
			type: 'line',
			smooth: true,
			symbol: 'none',
			color: '#8888dd',
			// stack: 'a',
			/* areaStyle: {
				normal: {}
			}, */ // 若有则代表面内填充
			// data: data2 // ! 后续设置
		},
	],
}

export default config
