
/**
 * Representa um Usuário
 * @class
 */
 export class User {
    /**
     * @constructor
     * @param {number} id - ID do Usuário
     * @param {string} uuid - UUID do Usuário
     * @param {string} username - Nome do Usuário
     * @param {string} password - Senha
     */
    constructor(id, uuid) {
        this.id = id;
        this.uuid = uuid;
        this.username = username;
        this.password = password;
    }

    /**
     * Cria e Retorna uma nova instância de um Usuário "vazia"
     * @returns {User} 
     */
    static empty() {
        return new User(-1, '', '', '');
    }
}