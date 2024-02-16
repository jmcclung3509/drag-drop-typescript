///<reference path="state.ts"/>
/// <reference path ="interfaces/draggable.ts"/>
/// <reference path ="utilities/validatable.ts"/>
/// <reference path ="decorators/autobind.ts"/>
/// <reference path ="project.ts"/>
/// <reference path ="components/project-input.ts"/>
/// <reference path ="components/project-list.ts"/>
/// <reference path = "components/project-item.ts"/>
/// <reference path ="components/base-component.ts"/>

 namespace App{


new ProjectInput(); //Calls the constructor
new ProjectList("active");
new ProjectList("finished");

 }