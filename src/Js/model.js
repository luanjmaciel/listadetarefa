// src/js/model.js

/**
 * @fileoverview Módulo para gerenciar a lógica de dados de tarefas e projetos.
 * @module model
 */

// Estado interno do módulo
let tasks = [];
let projects = [];
let currentProjectId = null;

let nextTaskId = 0;
let nextProjectId = 0;

// ===================================
// Funções de Gerenciamento de Tarefas
// ===================================

/**
 * Cria e retorna uma nova tarefa.
 * @param {object} dadosTarefa - Objeto com os dados da tarefa (titulo, descricao, etc.).
 * @returns {object} A nova tarefa criada.
 */
export function criaTarefa(dadosTarefa) {
    const novaTarefa = {
        id: nextTaskId++,
        ...dadosTarefa,
        concluida: false,
        dataCriacao: new Date().toLocaleString()
    };
    tasks.push(novaTarefa);
    return novaTarefa;
}

/**
 * Atualiza uma tarefa existente.
 * @param {number} id - O ID da tarefa a ser atualizada.
 * @param {object} novosDados - Objeto com os novos dados da tarefa.
 * @returns {boolean} Retorna true se a tarefa foi encontrada e atualizada.
 */
export function atualizaTarefa(id, novosDados) {
    const index = tasks.findIndex(t => t.id === id);
    if (index > -1) {
        tasks[index] = { ...tasks[index], ...novosDados };
        return true;
    }
    return false;
}

/**
 * Exclui uma tarefa pelo ID.
 * @param {number} id - O ID da tarefa a ser excluída.
 * @returns {boolean} Retorna true se a tarefa foi excluída.
 */
export function excluiTarefa(id) {
    const tarefaOriginal = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    return tasks.length < tarefaOriginal;
}

/**
 * Retorna a tarefa pelo ID.
 * @param {number} id - O ID da tarefa.
 * @returns {object|undefined} A tarefa encontrada ou undefined.
 */
export function getTarefa(id) {
    return tasks.find(t => t.id === id);
}

/**
 * Retorna uma cópia do array de tarefas.
 * @returns {Array<object>} Uma cópia das tarefas.
 */
export function getTasks() {
    return [...tasks];
}


// ===================================
// Funções de Gerenciamento de Projetos
// ===================================

/**
 * Cria e retorna um novo projeto.
 * @param {object} dadosProjeto - Objeto com os dados do projeto (nome, cor).
 * @returns {object} O novo projeto criado.
 */
export function criaProjeto(dadosProjeto) {
    const novoProjeto = {
        id: nextProjectId++,
        ...dadosProjeto
    };
    projects.push(novoProjeto);
    return novoProjeto;
}

/**
 * Atualiza um projeto existente.
 * @param {number} id - O ID do projeto a ser atualizado.
 * @param {object} novosDados - Objeto com os novos dados do projeto.
 * @returns {boolean} Retorna true se o projeto foi encontrado e atualizado.
 */
export function atualizaProjeto(id, novosDados) {
    const index = projects.findIndex(p => p.id === id);
    if (index > -1) {
        projects[index] = { ...projects[index], ...novosDados };
        return true;
    }
    return false;
}

/**
 * Exclui um projeto pelo ID e suas tarefas associadas.
 * @param {number} id - O ID do projeto a ser excluído.
 * @returns {boolean} Retorna true se o projeto foi excluído.
 */
export function excluiProjeto(id) {
    const projetoOriginal = projects.length;
    projects = projects.filter(p => p.id !== id);
    tasks = tasks.filter(t => t.projetoId !== id);
    return projects.length < projetoOriginal;
}

/**
 * Retorna o projeto pelo ID.
 * @param {number} id - O ID do projeto.
 * @returns {object|undefined} O projeto encontrado ou undefined.
 */
export function getProjeto(id) {
    return projects.find(p => p.id === id);
}

/**
 * Retorna uma cópia do array de projetos.
 * @returns {Array<object>} Uma cópia dos projetos.
 */
export function getProjects() {
    return [...projects];
}


// ===================================
// Funções de Estado da Aplicação
// ===================================

/**
 * Define o projeto ativo para visualização de tarefas.
 * @param {number} id - O ID do projeto.
 */
export function defineProjetoAtivo(id) {
    currentProjectId = id;
}

/**
 * Retorna o ID do projeto ativo.
 * @returns {number|null} O ID do projeto ativo.
 */
export function getCurrentProjectId() {
    return currentProjectId;
}

/**
 * Retorna as tarefas do projeto ativo.
 * @returns {Array<object>} As tarefas do projeto ativo.
 */
export function getTarefasDoProjeto() {
    return tasks.filter(t => t.projetoId === currentProjectId);
}

/**
 * Carrega os dados persistidos no estado do módulo.
 * @param {Array<object>} tarefas - O array de tarefas a ser carregado.
 * @param {Array<object>} projetos - O array de projetos a ser carregado.
 */
export function carregarDados(tarefas, projetos) {
    tasks = [...tarefas];
    if (tarefas.length > 0) {
        nextTaskId = Math.max(...tarefas.map(t => t.id)) + 1;
    }

    projects = [...projetos];
    if (projetos.length > 0) {
        nextProjectId = Math.max(...projetos.map(p => p.id)) + 1;
    }
}