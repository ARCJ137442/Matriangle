import { NARSEnv } from './server'
import configConstructor from './config/Experiment-car-collision.config.template'
import nodeServicesModifier from './config/node-services.modifier'

// 创建环境
const env = new NARSEnv(nodeServicesModifier(configConstructor()))

// 启动
void env.launch()
