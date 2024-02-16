namespace App {
   export  enum ProjectStatus {
        Active,
        Finished,
      } //Enum is a custom type that allows us to enumerate all the possible values
      
      //Project Type
     export class Project {
        constructor(
          public id: string,
          public title: string,
          public description: string,
          public rating: number,
          public dateAdded: Date,
          public dateFinished: Date | null,
          public status: ProjectStatus
        ) {}
      }
}