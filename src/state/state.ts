import { Project, ProjectStatus } from "../models/project.js";

type Listener<T> = (items: T[]) => void; //Don't need any return type

class State<T> {
  protected listeners: Listener<T>[] = []; //array of function
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

//Class that manages the state of the application
export class ProjectState extends State<Project> {
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
    const currentDate = new Date();
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      bookRating,
      currentDate,
      null,
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
      if (newStatus === ProjectStatus.Finished) {
        project.dateFinished = new Date();
      }
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
export const projectState = ProjectState.getInstance();
