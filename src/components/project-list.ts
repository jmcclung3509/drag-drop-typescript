// import { Component } from "./base-component.js";
import Cmp from "./base-component.js";
import { ProjectItem } from "./project-item.js";
import { Project, ProjectStatus } from "../models/project.js";
import { Autobind } from "../decorators/autobind.js";
import { DragTarget } from "../models/draggable.js";
import { projectState } from "../state/state.js";

export class ProjectList
  extends Cmp<HTMLDivElement, HTMLElement>
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
