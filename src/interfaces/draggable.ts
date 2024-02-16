namespace App {
    export interface Draggable {
        dragStartHandler(event: DragEvent): void; //listens to the start of the drag event
      
        dragEndHandler(event: DragEvent): void; //listens to the end of the drag event
      } //ProjectItem Class - is responsile for rendering individual project items
      
      export interface DragTarget {
        dragOverHandler(event: DragEvent): void; //The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds).
      
        dropHandler(event: DragEvent): void; //React to actual drop event
      
        dragLeaveHandler(event: DragEvent): void; //The dragleave event is fired when a dragged element or text selection leaves a valid drop target.
      }
}