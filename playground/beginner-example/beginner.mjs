export class Execute {
  constructor() {
    this.denyAccess = true;
  }

  ToggleBool(objectID, state) {
    console.log('command:toggle-bool', objectID, state);
  }
}

export class Database {
  constructor() {
    this.users = [{
      firstName: "Fred",
      lastName: "Smith",
      occupation: "Janitor",
    }, {
      firstName: "Bill",
      lastName: "Phillips",
      occupation: "CEO",
    }, {
      firstName: "Joshua",
      lastName: "Miles",
      occupation: "Engineer",
    }, {
      firstName: "Mike",
      lastName: "Miles",
      occupation: "Finances",
    }];

    this.company = {
      name: "Red Saber Industries",
      buildingNumber: "#382",
      street: "5th Street",
      district: "Indigo District"
    }
  }
}

export class System {
  constructor() {
    this.denyAccess = true;
    this.dependencies = [Execute, Database];
  }

  closeDoor() {
    this.Execute.ToggleBool('door-1', false);

    return 'Closing door 3K-J';
  }

  openDoor() {
    this.Execute.ToggleBool('door-1', true);

    return 'Opening door 3K-J';
  }
}

export class Authenticator {
  constructor() {
    this.dependencies = [System];
    this.passcode = '3K2NJ';
  }

  isValidPasscode( passcode ) {
    return passcode == this.passcode;
  }
}

export class SecurityDoor {
  constructor() {
    this.dependencies = [System, Authenticator];
  }

  close( passcode ) {
    if ( this.Authenticator.isValidPasscode(passcode) ) {
      return this.System.closeDoor();
    }

    return 'Wrong passcode';
  }

  open( passcode ) {
    if ( this.Authenticator.isValidPasscode(passcode) ) {
      return this.System.openDoor();
    }

    return 'Wrong passcode';
  }
}
