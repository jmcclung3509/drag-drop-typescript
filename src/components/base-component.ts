namespace App {
   export  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateElement: HTMLTemplateElement; //
        hostElement: T; //the element where the template will be rendered
        element: U; //The element that will be rendered (li)
      
        constructor(
          templateId: string,
          hostElementId: string,
          insertAtStart: boolean,
          newElementId?: string
        ) {
          this.templateElement = (<HTMLTemplateElement>(
            document.getElementById(templateId)!
          )) as HTMLTemplateElement;
          this.hostElement = document.getElementById(hostElementId)! as T;
          const importedNode = document.importNode(
            this.templateElement.content,
            true
          );
          this.element = importedNode.firstElementChild as U;
          if (newElementId) {
            this.element.id = newElementId;
          }
          this.attach(insertAtStart);
          //Section element
        }
        private attach(insertAtBeginning: boolean) {
          //render the list to the DOM
          this.hostElement.insertAdjacentElement(
            insertAtBeginning ? "afterbegin" : "beforeend",
            this.element
          ); //beforeend is the last child of the host element
        }
        abstract configure(): void;
        abstract renderContent(): void; //Force any class inheriting from this class to implement this method
      }
      
}