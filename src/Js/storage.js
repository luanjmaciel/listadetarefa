// src/js/storage.js

/**
 * @fileoverview Módulo para gerenciar a persistência de dados no localStorage.
 * @module storage
 */

import { logInfo, logError } from './logger.js';
// CORREÇÃO: Importa as funções getTasks e getProjects
import { getTasks, getProjects, setTasks, setProjects } from './model.js';

const TASKS_KEY = 'tasks';
const PROJECTS_KEY = 'projects';

/**
 * Salva as tarefas e projetos no localStorage.
 * @param {Array<object>} tasks - O array de tarefas a ser salvo.
 * @param {Array<object>} projects - O array de projetos a ser salvo.
 */
export function salvaDados() {
    try {
        // CORREÇÃO: Chama as funções do model.js para obter os dados
        const tasks = getTasks();
        const projects = getProjects();
        
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        logInfo('Dados salvos no localStorage.');
    } catch (e) {
        logError('Erro ao salvar dados no localStorage:', e);
    }
}

/**
 * Carrega as tarefas e projetos do localStorage e popula o model.
 */
export function carregaDados() {
    try {
        const tarefasSalvas = localStorage.getItem(TASKS_KEY);
        const projetosSalvos = localStorage.getItem(PROJECTS_KEY);

        const tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
        const projetos = projetosSalvos ? JSON.parse(projetosSalvos) : [];

        // Popula o model com os dados carregados
        setTasks(tarefas);
        setProjects(projetos);

        logInfo('Dados carregados do localStorage e aplicados ao model.');
    } catch (e) {
        logError('Erro ao carregar dados do localStorage:', e);
        setTasks([]);
        setProjects([]);
    }
}

// Nenhuma alteração necessária aqui.