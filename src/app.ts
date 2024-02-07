//ENUM
enum ProjectStatus {
  Active,
  Finished,
} //Enum is a custom type that allows us to enumerate all the possible values

//Project Type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
type Listener<T> = (items: T[]) => void; //Don't need any return type
//BASE CLASS FOR STATE

class State<T> {
  protected listeners: Listener<T>[] = []; //array of function
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

//Class that manages the state of the application
class ProjectState extends State<Project> {
  //listeners
  private projects: Project[] = []; //initialize an empty array
  private static instance: ProjectState;
  private constructor() {
    super();
  }
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    // const newProject = {
    // 	id: Math.random().toString(),
    // 	title: title,
    // 	description: description,
    // 	people: numOfPeople
    // };
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); //slice() returns a copy of the array
    }
  }
}
//Create a global instance of the project class

// const projectState= new ProjectState();
const projectState = ProjectState.getInstance();

//Validate input
interface Validatable {
  //could also use a  custom type
  value: string | number;
  required?: boolean;
  minLength?: number; //length of the string
  maxLength?: number;
  min?: number; //checks if it is a number
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0; //The way this works if anything after isValid is false, the whole thing is false
  }
  //need to add validatableInput.minLength != null because 0 is a falsy value and we want to allow 0
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length > validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length < validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value > validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value < validatableInput.max;
  }
  return isValid;
}
//Autobind Decorator
function Autobind(
  _: any, //target
  _2: string, //methodName
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      return boundFunction;
    },
  };
  return adjustedDescriptor;
}
//UI COM{ONENT BASE CLASS
//create a generic class- when inherite set generic type
//abstract class- can't be instantiated directly, only used for inheritance
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

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
//ProjectList Class -output
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  // templateElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement;
  // element: HTMLElement; //Section element
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    //UNION TYPE
    super("project-list", "app", false, `${type}-projects`); //super calls the constructor of the base class

    this.assignedProjects = [];

    // this.attach()
    this.configure();
    this.renderContent();
  }
  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((proj) => {
        //when returns true keep item in new aray relevantProjects

        if (this.type === "active") {
          return proj.status === ProjectStatus.Active;
        } else {
          return proj.status === ProjectStatus.Finished;
        }
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    //Fill the blank spaces in template
    //ad id to UL
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " " + "PROJECTS";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    //TO remove duplicates

    listEl.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl.appendChild(listItem);
    }
  }
}

//ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // templateElement: HTMLTemplateElement; //The <template> HTML element serves as a mechanism for holding HTML fragments, which can either be used later via JavaScript or generated immediately into shadow DOM.
  // hostElement: HTMLDivElement; //Output container where the form will be rendered
  // element: HTMLFormElement; //FORM
  titleInputElement: HTMLInputElement; //Form Title
  descriptionInputElement: HTMLInputElement; //Form Description
  peopleInputElement: HTMLInputElement; //Number of people

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
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    // this.attach(); //Attach the form to the DOM
    this.configure();
    //Submit event listener
  }

  gatherUserInput(): [string, string, number] | void {
    //TUPLE   Return a tuple or nothing.  A Tuple is an array with fixed elements and types
    const enteredTitle = this.titleInputElement.value;
    const enteredDescript = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescript,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10,
    };

    //make sure input is not empty
    // if (enteredTitle.length === 0 || enteredDescript.length === 0 || enteredPeople.length === 0) {
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("please enter valid input");
    } else {
      return [enteredTitle, enteredDescript, +enteredPeople]; //Return your tuple
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
      const [title, desc, people] = userInput;
      console.log(title, desc, people);

      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}
const projectEl = new ProjectInput(); //Calls the constructor

const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
