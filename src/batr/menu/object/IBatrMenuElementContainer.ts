
// import batr.common.*;
// import batr.general.*;

// import batr.menu.events.*;
// import batr.menu.object.*;

// import flash.display.*;

export default interface IBatrMenuElementContainer extends IBatrMenuElement {
	appendDirectElement(element: IBatrMenuElement): IBatrMenuElement;
	appendDirectElements(...elements): IBatrMenuElement;
	addChildPerDirectElements(): void;

	getElementAt(index: int): IBatrMenuElement;
	getElementByName(name: string): BatrMenuGUI;
}