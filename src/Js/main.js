/**
 * @fileoverview Ponto de entrada principal da aplicação.
 * @module main
 */

import { carregaDados } from './storage.js';
import { getProjects, getCurrentProjectId } from './model.js';
import { renderizaProjetos, defineProjetoAtivoNaUI, showTaskModal, saveTask, closeModal, showProjectModal, saveProject, setFilter } from './ui.js';

// Adiciona event listeners para os botões e modais
function adicionarEventListeners() {
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) addTaskBtn.addEventListener('click', () => showTaskModal());

    const saveTaskBtn = document.getElementById('save-task-btn');
    if (saveTaskBtn) saveTaskBtn.addEventListener('click', saveTask);

    const closeTaskBtn = document.querySelector('#taskModal .close-btn');
    if (closeTaskBtn) closeTaskBtn.addEventListener('click', () => closeModal('taskModal'));

    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) addProjectBtn.addEventListener('click', () => showProjectModal());

    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) saveProjectBtn.addEventListener('click', saveProject);

    const closeProjectBtn = document.querySelector('#projectModal .close-btn');
    if (closeProjectBtn) closeProjectBtn.addEventListener('click', () => closeModal('projectModal'));

    const filterAll = document.getElementById('filter-all');
    if (filterAll) filterAll.addEventListener('click', () => setFilter('all'));

    const filterPending = document.getElementById('filter-pending');
    if (filterPending) filterPending.addEventListener('click', () => setFilter('pending'));

    const filterCompleted = document.getElementById('filter-completed');
    if (filterCompleted) filterCompleted.addEventListener('click', () => setFilter('completed'));
}

/**
 * Inicializa a aplicação.
 */
function inicializaApp() {
    carregaDados();
    renderizaProjetos();
    const projetos = getProjects();
    if (projetos.length > 0) {
        if (!getCurrentProjectId()) {
            defineProjetoAtivoNaUI(projetos[0].id);
        } else {
            defineProjetoAtivoNaUI(getCurrentProjectId());
        }
    }
}

// Inicia a aplicação quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    inicializaApp();
    adicionarEventListeners();
});