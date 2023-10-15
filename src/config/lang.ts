// maybe need to scan all of the json in the folder `lang`
import * as zh_hans from './lang/zh_hans.json'
import * as en_us from './lang/en_us.json'
import { flattenObject } from '../common/utils'

// uses flatten objects to auto generate key, and export all languages as whole object
export default {
	zh_hans: flattenObject(zh_hans),
	en_us: flattenObject(en_us),
}
