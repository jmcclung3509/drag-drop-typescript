/// <reference path ="base-component.ts"/>
///<reference path ="../decorators/autobind.ts"/>
/// <reference path ="../state.ts"/>
/// <reference path ="../interfaces/draggable.ts"/>
/// <reference path ="../project.ts"/>

namespace App {
   export  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
        // templateElement: HTMLTemplateElement; //The <template> HTML element serves as a mechanism for holding HTML fragments, which can either be used later via JavaScript or generated immediately into shadow DOM.
        // hostElement: HTMLDivElement; //Output container where the form will be rendered
        // element: HTMLFormElement; //FORM
        titleInputElement: HTMLInputElement; //Form Title
        descriptionInputElement: HTMLInputElement; //Form Description
        ratingInputElement: HTMLInputElement; //Number of stars
      
        constructor() {
          super("project-input", "app", true, "user-input");
          // this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
          // this.hostElement = <HTMLDivElement>document.getElementById('app')!;
      
          // const importedNode = document.importNode(this.templateElement.content, true);
          // this.element = importedNode.firstElementChild as HTMLFormElement;
          // this.element.id = "user-id";
          this.titleInputElement = this.element.querySelector(
            "#title"
          ) as HTMLInputElement;
          this.descriptionInputElement = this.element.querySelector(
            "#description"
          ) as HTMLInputElement;
          this.ratingInputElement = this.element.querySelector(
            "#rating"
          ) as HTMLInputElement;
      
          // this.attach(); //Attach the form to the DOM
          this.configure();
          this.renderContent();
          //Submit event listener
        }
      
        gatherUserInput(): [string, string, number] | void {
          //TUPLE   Return a tuple or nothing.  A Tuple is an array with fixed elements and types
          const enteredTitle = this.titleInputElement.value;
          const enteredDescript = this.descriptionInputElement.value;
          const enteredRating = this.ratingInputElement.value;
      
          const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
          };
          const descriptionValidatable: Validatable = {
            value: enteredDescript,
            required: true,
            minLength: 5,
          };
          const ratingValidatable: Validatable = {
            value: +enteredRating,
            required: true,
            min: 0,
            max: 6,
          };
      
          //make sure input is not empty
          // if (enteredTitle.length === 0 || enteredDescript.length === 0 || enteredPeople.length === 0) {
          if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(ratingValidatable)
          ) {
            alert("please enter valid input");
          } else {
            return [enteredTitle, enteredDescript, +enteredRating]; //Return your tuple
          }
        }
      
        configure() {
          this.element.addEventListener("submit", this.submitHandler); //bind because otherwise this will refer to the form and not the class
          // this.element.addEventListener('submit', this.submitHandler.bind(this)) //bind because otherwise this will refer to the form and not the class
        }
        renderContent() {}
        @Autobind
        private submitHandler(event: Event) {
          event.preventDefault();
          const userInput = this.gatherUserInput();
          // if(userInput typeof === 'array'){
          if (Array.isArray(userInput)) {
            //A tuple is just an array
            // const title=userInput[0];
            // const desc=userInput[1];
            // const people=userInput[2];
            const [title, desc, rating] = userInput;
            const currentDate = new Date();
            console.log(title, desc, rating, currentDate);
      
            projectState.addProject(title, desc, rating); // Convert date to a Date object
            this.clearInputs();
          }
        }
      
        private clearInputs() {
          this.titleInputElement.value = "";
          this.descriptionInputElement.value = "";
          this.ratingInputElement.value = "";
        }
      }
}