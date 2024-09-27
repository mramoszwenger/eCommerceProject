class UserDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.username = user.username;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
  }
}

export default UserDTO;