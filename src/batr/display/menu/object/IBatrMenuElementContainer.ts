

import { int } from "../../legacy/AS3Legacy";
import BatrMenuGUI from "./BatrMenuGUI";
import IBatrMenuElement from "./IBatrMenuElement";

export default interface IBatrMenuElementContainer extends IBatrMenuElement {
	appendDirectElement(element: IBatrMenuElement): IBatrMenuElementContainer;
	appendDirectElements(...elements: IBatrMenuElement[]): IBatrMenuElementContainer;
	addChildPerDirectElements(): void;

	getElementAt(index: int): IBatrMenuElement;
	getElementByName(name: string): BatrMenuGUI;
}