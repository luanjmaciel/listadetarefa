// src/js/main.js

/**
 * @fileoverview Ponto de entrada principal da aplicação.
 * @module main
 */

import { carregaDados, salvaDados } from './storage.js';
import { carregarDados, criaProjeto, defineProjetoAtivo, getProjects } from './model.js';
import { renderizaProjetos, renderizaTarefas, defineProjetoAtivoNaUI } from './ui.js';
import { logInfo } from './logger.js';

// Importe todas as funções de UI para que elas possam ser acessadas no HTML
import * as ui from './ui.js';
window.ui = ui;

// Adiciona event listeners para os botões e modais
function adicionarEventListeners() {
    document.getElementById('add-task-btn').addEventListener('click', () => {
        ui.showTaskModal();
    });
    document.getElementById('save-task-btn').addEventListener('click', ui.saveTask);
    document.querySelector('#taskModal .close-btn').addEventListener('click', () => ui.closeModal('taskModal'));

    document.getElementById('add-project-btn').addEventListener('click', () => ui.showProjectModal());
    document.getElementById('save-project-btn').addEventListener('click', ui.saveProject);
    document.querySelector('#projectModal .close-btn').addEventListener('click', () => ui.closeModal('projectModal'));

    document.getElementById('filter-all').addEventListener('click', () => ui.setFilter('all'));
    document.getElementById('filter-pending').addEventListener('click', () => ui.setFilter('pending'));
    document.getElementById('filter-completed').addEventListener('click', () => ui.setFilter('completed'));
}

/**
 * Inicializa a aplicação.
 */
function inicializaApp() {
    logInfo('Iniciando a aplicação...');
    
    const dadosCarregados = carregaDados();
    carregarDados(dadosCarregados.tasks, dadosCarregados.projects);
    
    const projetosExistentes = getProjects();
    if (projetosExistentes.length === 0) {
        logInfo('Nenhum projeto encontrado. Criando um projeto padrão "Caixa de Entrada".');
        const projetoPadrao = criaProjeto({ nome: 'Caixa de Entrada', cor: 'blue' });
        
        salvaDados();

        defineProjetoAtivo(projetoPadrao.id);
    } else {
        defineProjetoAtivo(projetosExistentes[0].id);
    }
    
    adicionarEventListeners();
    renderizaProjetos();
    // CORREÇÃO: Removido a chamada redundante para renderizaTarefas().
    // A função defineProjetoAtivoNaUI() já fará isso.
    // renderizaTarefas(); 
    
    const projetosAtualizados = getProjects();
    if (projetosAtualizados.length > 0) {
        defineProjetoAtivoNaUI(projetosAtualizados[0].id);
    }

    logInfo('Aplicação inicializada com sucesso.');
}

// Inicia a aplicação quando a página é carregada
document.addEventListener('DOMContentLoaded', inicializaApp);