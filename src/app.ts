interface Draggable {
  dragStartHandler(event: DragEvent): void; //listens to the start of the drag event

  dragEndHandler(event: DragEvent): void; //listens to the end of the drag event
} //ProjectItem Class - is responsile for rendering individual project items

interface DragTarget {
  dragOverHandler(event: DragEvent): void; //The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds).

  dropHandler(event: DragEvent): void; //React to actual drop event

  dragLeaveHandler(event: DragEvent): void; //The dragleave event is fired when a dragged element or text selection leaves a valid drop target.
} //PrjocetList Class - the boxes active and finsihed are the drag targets

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
    public rating: number,
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

  addProject(title: string, description: string, bookRating: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      bookRating,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => {
      return prj.id === projectId;
    });
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
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

//ProjectItem class

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get rating() {
    if (this.project.rating === 1) {
      return "1 star";
    } else {
      return `${this.project.rating} stars`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
  }

  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id); //just  need the id of the project
    event.dataTransfer!.effectAllowed = "move"; //alternative could be 'copy' -
  }

  @Autobind
  dragEndHandler(_: DragEvent) {}

  configure() {
    this.element.addEventListener(
      "dragstart",
      this.dragStartHandler.bind(this)
    ); //or add AUTOBIND
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    const titleElement = this.element.querySelector("h2");
    const ratingElement = this.element.querySelector("h3");
    const descriptionElement = this.element.querySelector("p");

    if (titleElement && ratingElement && descriptionElement) {
      titleElement.textContent = this.project.title;

      descriptionElement.textContent = this.project.description;
      ratingElement.textContent = this.rating;
    } else {
      console.error("One or more elements not found in renderContent");
    }
  }
}
//ProjectList Class -output
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  //DRAG TARGET
  // templateElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement;
  // element: HTMLElement; //Section element
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    //UNION TYPE
    super("project-list", "app", false, `${type}-projects`); //super calls the constructor of the base class

    this.assignedProjects = []; //initialize an empty array will become the array of list items

    // this.attach()
    this.configure();
    this.renderContent();
  }
  @Autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault(); //allows the drop event
      const listEL = this.element.querySelector("ul")!;
      console.log(listEL);
      listEL.classList.add("droppable");
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    console.log("dropped", event.dataTransfer!.getData("text/plain"));
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listEL = this.element.querySelector("ul")!;
    listEL.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

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
    console.log("Rendering projects:", this.assignedProjects);
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    // TO remove duplicates
    listEl.innerHTML = "";

    for (const projectItem of this.assignedProjects) {
      console.log(projectItem.title);
      const projectItemComponent = new ProjectItem(
        this.element.querySelector("ul")!.id,
        projectItem
      );

      projectItemComponent.configure();
      projectItemComponent.renderContent();
      listEl.appendChild(projectItemComponent.element); //pass id of host element (ul) and item (li), but this.element is not the UL but the section-
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
      min: 1,
      max: 5,
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
      console.log(title, desc, rating);

      projectState.addProject(title, desc, rating);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.ratingInputElement.value = "";
  }
}
const projectEl = new ProjectInput(); //Calls the constructor

const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
//drag and drop interfaces
