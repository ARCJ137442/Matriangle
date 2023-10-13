export module GlobalServerInformation {
	export const NAME: string = 'Matriangle'
	export const NAME_SHORT: string = 'BaTS'
	export const DEV_STAGE: string = 'TS'
	export const VERSION_MAJOR: string = '0.0.1'
	export const VERSION_MAIN: string = 'alpha'
	export const VERSION_BUILD: string = '01'
	export const UPDATE_LOG: string = 'The First Immigration towards TypeScript'

	export const FULL_VERSION = 'v' + VERSION_MAJOR + '-' + VERSION_MAIN + '.' + VERSION_BUILD
	export const FULL_NAME = NAME + ' ' + DEV_STAGE + ' ' + FULL_VERSION
}
