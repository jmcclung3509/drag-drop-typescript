/// <reference path ="base-component.ts"/>
///<reference path ="../decorators/autobind.ts"/>
/// <reference path ="../decorators/autobind.ts"/>
/// <reference path ="../interfaces/draggable.ts"/>

namespace App {
export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  private getDateAndStatus(): string {
    if (
      this.project.status === ProjectStatus.Finished &&
      this.project.dateFinished
    ) {
      return `Added: ${this.project.dateAdded.toLocaleDateString()} -- Finished: ${this.project.dateFinished.toLocaleDateString()} `;
    } else {
      return `Added: ${this.project.dateAdded.toLocaleDateString()}`;
    }
  }

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
    const dateElement = this.element.querySelector("span")!;

    if (titleElement && ratingElement && descriptionElement) {
      titleElement.textContent = this.project.title;
      descriptionElement.textContent = this.project.description;
      ratingElement.textContent = this.rating;
      dateElement.innerHTML = this.getDateAndStatus();
    } else {
      console.error("One or more elements not found in renderContent");
    }
  }
}
}