class UserDTO {
    constructor(newUser) {
      this.id = newUser._id;
      this.name = newUser.name;
      this.email = newUser.email;
    }
  }
  
  export default UserDTO;