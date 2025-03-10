// Representação simples do usuário
class User {
    constructor({ id, username, password, role }) {
      this.id = id;
      this.username = username;
      this.password = password;
      this.role = role || 'vendedor'; // 'gestor' ou 'vendedor'
    }
  }
  
  module.exports = User;
  