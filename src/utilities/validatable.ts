namespace App {
   export  interface Validatable {
    //could also use a  custom type
    value: string | number;
    required?: boolean;
    minLength?: number; //length of the string
    maxLength?: number;
    min?: number; //checks if it is a number
    max?: number;
  }
  
 export  function validate(validatableInput: Validatable) {
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
}