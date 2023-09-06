/**
 * The mirror of Flash platform package.
 * It usually uses the static constants, so IT NEEDS ABSTRACT CLASSES by `abstract`
 * Not needs to implement all of the class and functions, so THE DECLARE STATEMENT IS WHAT IT NEED by `declare`
 *   BTW, some classes must be used, in this case THEY SHOULD BE IMPLEMENTED AS ABSTRACT CLASSES
 * Finally, it need to "use" by other modules, so EXPORT IS NECESSARILY NEED by `export`
 */
export * as utils from "./flash/utils"
export * as display from "./flash/display"
export * as events from "./flash/events"
export * as geom from "./flash/geom"

// export { flash }; // cannot use default
