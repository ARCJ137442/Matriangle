import { NARSEnv } from './server'
import config from './config/Experiment-car-collision.config'

// 创建环境
const env = new NARSEnv(config)

// 启动
void env.launch()
