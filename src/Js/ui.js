/**
 * @fileoverview Módulo para gerenciar a interface de usuário (UI).
 * @module ui
 */

import {
    criaTarefa,
    atualizaTarefa,
    excluiTarefa,
    criaProjeto,
    atualizaProjeto,
    excluiProjeto,
    defineProjetoAtivo,
    getTarefasDoProjeto,
    getTarefa,
    getProjeto,
    getProjects,
    getTasks,
    getCurrentProjectId
} from './model.js';
import { salvaDados, carregaDados } from './storage.js';
import { logInfo, logWarn } from './logger.js';

// Elementos do DOM
const tasksContainer = document.getElementById('tasks-container');
const projectsContainer = document.getElementById('projects-container');
const postItSection = document.getElementById('post-it-section');
const currentProjectName = document.getElementById('current-project-name');

const taskModal = document.getElementById('taskModal');
const projectModal = document.getElementById('projectModal');

const taskTitleInput = document.getElementById('task-title-input');
const taskDescriptionInput = document.getElementById('task-description-input');
const taskDueDateInput = document.getElementById('task-due-date-input');
const taskPriorityInput = document.getElementById('task-priority-input');
const taskColorInput = document.getElementById('task-color-input');
const taskProjectInput = document.getElementById('task-project-input');

const projectNameInput = document.getElementById('project-name-input');
const projectColorInput = document.getElementById('project-color-input');
const projectModalTitle = document.getElementById('project-modal-title');
const saveProjectBtn = document.getElementById('save-project-btn');

const filterButtons = document.querySelectorAll('.filter-btn');

let editingTaskId = null;
let editingProjectId = null;
let currentFilter = 'all';

// ===================================
// Funções de Renderização
// ===================================

/**
 * Renderiza a lista de projetos na interface.
 */
export function renderizaProjetos() {
    logInfo('Renderizando projetos.');
    projectsContainer.innerHTML = '';
    const projects = getProjects();
    projects.forEach(projeto => {
        const item = criaElementoProjeto(projeto);
        projectsContainer.appendChild(item);
    });
}

/**
 * Cria o elemento HTML para um projeto.
 * @param {object} projeto - O objeto do projeto.
 * @returns {HTMLElement} O elemento do projeto.
 */
function criaElementoProjeto(projeto) {
    const item = document.createElement('div');
    item.className = `project-item ${projeto.cor}`;
    item.innerHTML = `
        <span class="item-title">${projeto.nome}</span>
        <div class="item-actions">
            <i class="fas fa-edit edit-btn"></i>
            <i class="fas fa-copy copy-btn"></i>
            <i class="fas fa-trash-alt trash-btn"></i>
        </div>
    `;

    // Adiciona os event listeners diretamente no JavaScript
    item.querySelector('.item-title').addEventListener('click', () => {
        defineProjetoAtivoNaUI(projeto.id);
    });

    item.querySelector('.edit-btn').addEventListener('click', () => {
        showProjectModal(projeto.id);
    });

    item.querySelector('.copy-btn').addEventListener('click', () => {
        duplicaProjetoNaUI(projeto.id);
    });

    item.querySelector('.trash-btn').addEventListener('click', () => {
        excluiProjetoNaUI(projeto.id);
    });

    return item;
}

/**
 * Define o projeto ativo na UI e renderiza suas tarefas.
 * @param {number} projectId - O ID do projeto.
 */
export function defineProjetoAtivoNaUI(projectId) {
    defineProjetoAtivo(projectId);
    const projeto = getProjeto(projectId);
    if (projeto) {
        currentProjectName.textContent = projeto.nome;
    }
    renderizaTarefas();
    logInfo(`Projeto ativo definido para: ${projeto.nome}`);
}

/**
 * Renderiza a lista de tarefas na interface para o projeto ativo, aplicando o filtro e a ordenação.
 */
export function renderizaTarefas() {
    logInfo('Renderizando tarefas.');
    tasksContainer.innerHTML = '';
    let tarefasDoProjeto = getTarefasDoProjeto();
    
    tarefasDoProjeto.sort(ordenaPorPrioridade);

    if (currentFilter === 'pending') {
        tarefasDoProjeto = tarefasDoProjeto.filter(t => !t.concluida);
    } else if (currentFilter === 'completed') {
        tarefasDoProjeto = tarefasDoProjeto.filter(t => t.concluida);
    }

    if (tarefasDoProjeto.length === 0) {
        tasksContainer.innerHTML = '<p style="text-align: center; color: #777;">Nenhuma tarefa neste projeto.</p>';
        postItSection.innerHTML = '<p class="no-task-selected">Selecione uma tarefa para ver os detalhes.</p>';
        return;
    }

    tarefasDoProjeto.forEach(tarefa => {
        const taskItem = criaElementoTarefa(tarefa);
        tasksContainer.appendChild(taskItem);
    });
    
    // Se houver tarefas, exibe a primeira no post-it
    if (tarefasDoProjeto.length > 0) {
        showPostIt(tarefasDoProjeto[0].id);
    } else {
        postItSection.innerHTML = '<p class="no-task-selected">Selecione uma tarefa para ver os detalhes.</p>';
    }
}

/**
 * Cria o elemento HTML para uma tarefa.
 * @param {object} tarefa - O objeto da tarefa.
 * @returns {HTMLElement} O elemento da tarefa.
 */
function criaElementoTarefa(tarefa) {
    const taskItem = document.createElement('div');
    const completionClass = tarefa.concluida ? 'completed' : '';
    taskItem.className = `task-item ${tarefa.cor} ${completionClass}`;
    taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${tarefa.concluida ? 'checked' : ''}>
        <span class="item-title">${tarefa.titulo}</span>
        <div class="item-actions">
            <i class="fas fa-edit edit-btn"></i>
            <i class="fas fa-copy copy-btn"></i>
            <i class="fas fa-trash-alt trash-btn"></i>
        </div>
    `;

    // Adiciona os event listeners diretamente no JavaScript
    taskItem.querySelector('.task-checkbox').addEventListener('click', (event) => {
        toggleTaskCompletion(tarefa.id, event);
    });

    taskItem.querySelector('.item-title').addEventListener('click', () => {
        showPostIt(tarefa.id);
    });

    taskItem.querySelector('.edit-btn').addEventListener('click', () => {
        showTaskModal(tarefa.id);
    });

    taskItem.querySelector('.copy-btn').addEventListener('click', () => {
        duplicaTarefaNaUI(tarefa.id);
    });

    taskItem.querySelector('.trash-btn').addEventListener('click', () => {
        excluiTarefaNaUI(tarefa.id);
    });

    return taskItem;
}

/**
 * Função auxiliar para ordenar tarefas por prioridade.
 * @param {object} a - A primeira tarefa para comparação.
 * @param {object} b - A segunda tarefa para comparação.
 * @returns {number} O valor de ordenação.
 */
function ordenaPorPrioridade(a, b) {
    const prioridades = {
        'alta': 3,
        'media': 2,
        'baixa': 1
    };
    return prioridades[b.prioridade] - prioridades[a.prioridade];
}

/**
 * Mostra o post-it de uma tarefa.
 * @param {number} taskId - O ID da tarefa.
 */
export function showPostIt(taskId) {
    const tarefa = getTarefa(taskId);
    if (!tarefa) {
        logWarn(`Tarefa com ID ${taskId} não encontrada.`);
        postItSection.innerHTML = '<p class="no-task-selected">Selecione uma tarefa para ver os detalhes.</p>';
        return;
    }

    postItSection.innerHTML = '';
    const postItDiv = document.createElement('div');
    postItDiv.className = `post-it ${tarefa.cor}-bg`;
    postItDiv.innerHTML = `
        <div class="tape-top"></div>
        <div class="tape-top right"></div>
        <div class="post-it-content">
            <h2 class="activity-title">${tarefa.titulo}</h2>
            <p><strong>Descrição:</strong> ${tarefa.descricao}</p>
            <p><strong>Data de Vencimento:</strong> ${tarefa.dataVencimento}</p>
            <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
            <div class="task-created">Tarefa Criada em: ${tarefa.dataCriacao}</div>
        </div>
    `;
    postItSection.appendChild(postItDiv);
    logInfo(`Post-it da tarefa ${tarefa.id} exibido.`);
}

// ===================================
// Funções de Modal e Interação
// ===================================

/**
 * Abre o modal de tarefa para adicionar ou editar.
 * @param {number} [taskId=null] - O ID da tarefa a ser editada. Se nulo, abre para adicionar.
 */
export function showTaskModal(taskId = null) {
    editingTaskId = taskId;
    
    taskProjectInput.innerHTML = '';
    getProjects().forEach(projeto => {
        const option = document.createElement('option');
        option.value = projeto.id;
        option.textContent = projeto.nome;
        taskProjectInput.appendChild(option);
    });

    if (taskId !== null) {
        const tarefa = getTarefa(taskId);
        if (tarefa) {
            document.getElementById('task-modal-title').textContent = 'Editar Tarefa';
            taskTitleInput.value = tarefa.titulo;
            taskDescriptionInput.value = tarefa.descricao;
            taskDueDateInput.value = tarefa.dataVencimento;
            taskPriorityInput.value = tarefa.prioridade;
            taskColorInput.value = tarefa.cor;
            taskProjectInput.value = tarefa.projetoId;
        }
    } else {
        document.getElementById('task-modal-title').textContent = 'Adicionar Nova Tarefa';
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskDueDateInput.value = '';
        taskPriorityInput.value = 'baixa';
        taskColorInput.value = 'blue';
        if (getCurrentProjectId() !== null) {
            taskProjectInput.value = getCurrentProjectId();
        }
    }
    taskModal.style.display = 'block';
}

/**
 * Salva uma nova tarefa ou as alterações de uma existente.
 */
export function saveTask() {
    const titulo = taskTitleInput.value.trim();
    const descricao = taskDescriptionInput.value.trim();
    const dataVencimento = taskDueDateInput.value;
    const prioridade = taskPriorityInput.value;
    const cor = taskColorInput.value;
    const projetoId = parseInt(taskProjectInput.value, 10);

    if (!titulo) {
        alert('O título da tarefa não pode ser vazio!');
        return;
    }
    
    if (isNaN(projetoId) || projetoId === undefined) {
        alert('Selecione um projeto para a tarefa!');
        return;
    }

    const dadosTarefa = { titulo, descricao, dataVencimento, prioridade, cor, projetoId };

    if (editingTaskId !== null) {
        atualizaTarefa(editingTaskId, dadosTarefa);
        logInfo(`Tarefa ${editingTaskId} atualizada.`);
    } else {
        criaTarefa(dadosTarefa);
        logInfo('Nova tarefa adicionada.');
    }
    salvaDados(getTasks(), getProjects());
    renderizaTarefas();
    closeModal('taskModal');
}

/**
 * Duplica uma tarefa.
 * @param {number} taskId - O ID da tarefa a ser duplicada.
 */
export function duplicaTarefaNaUI(taskId) {
    const tarefaOriginal = getTarefa(taskId);
    if (tarefaOriginal) {
        const novosDados = {
            titulo: `Cópia de ${tarefaOriginal.titulo}`,
            descricao: tarefaOriginal.descricao,
            dataVencimento: tarefaOriginal.dataVencimento,
            prioridade: tarefaOriginal.prioridade,
            cor: tarefaOriginal.cor,
            projetoId: tarefaOriginal.projetoId
        };
        criaTarefa(novosDados);
        salvaDados(getTasks(), getProjects());
        renderizaTarefas();
        logInfo(`Tarefa ${taskId} duplicada.`);
    }
}

/**
 * Exclui uma tarefa da UI.
 * @param {number} taskId - O ID da tarefa.
 */
export function excluiTarefaNaUI(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        excluiTarefa(taskId);
        salvaDados(getTasks(), getProjects());
        renderizaTarefas();
        logInfo(`Tarefa ${taskId} excluída.`);
    }
}

/**
 * Abre o modal de projetos.
 * @param {number} [projectId=null] - O ID do projeto a ser editado. Se nulo, abre para adicionar.
 */
export function showProjectModal(projectId = null) {
    editingProjectId = projectId;
    if (projectId !== null) {
        const projeto = getProjeto(projectId);
        if (projeto) {
            projectModalTitle.textContent = 'Editar Projeto';
            projectNameInput.value = projeto.nome;
            projectColorInput.value = projeto.cor;
            saveProjectBtn.textContent = 'Salvar Alterações';
        }
    } else {
        projectModalTitle.textContent = 'Adicionar Novo Projeto';
        projectNameInput.value = '';
        projectColorInput.value = 'blue';
        saveProjectBtn.textContent = 'Salvar Projeto';
    }
    projectModal.style.display = 'block';
}

/**
 * Salva um novo projeto ou as alterações de um existente.
 */
export function saveProject() {
    const nome = projectNameInput.value.trim();
    const cor = projectColorInput.value;
    
    if (!nome) {
        alert('O nome do projeto não pode ser vazio!');
        return;
    }
    
    const dadosProjeto = { nome, cor };
    let novoProjetoId = null;

    if (editingProjectId !== null) {
        atualizaProjeto(editingProjectId, dadosProjeto);
        logInfo(`Projeto ${editingProjectId} atualizado.`);
        novoProjetoId = editingProjectId;
    } else {
        const novoProjeto = criaProjeto(dadosProjeto);
        logInfo('Novo projeto adicionado.');
        novoProjetoId = novoProjeto.id;
    }
    salvaDados(getTasks(), getProjects());
    renderizaProjetos();
    
    if (getCurrentProjectId() !== novoProjetoId) {
        defineProjetoAtivoNaUI(novoProjetoId);
    } else {
        renderizaTarefas();
    }
    closeModal('projectModal');
}

/**
 * Duplica um projeto e todas as suas tarefas.
 * @param {number} projectId - O ID do projeto a ser duplicado.
 */
export function duplicaProjetoNaUI(projectId) {
    const projetoOriginal = getProjeto(projectId);
    if (projetoOriginal) {
        const novoProjeto = criaProjeto({ nome: `Cópia de ${projetoOriginal.nome}`, cor: projetoOriginal.cor });
        const tarefasDoProjeto = getTarefasDoProjeto(projectId);
        tarefasDoProjeto.forEach(tarefa => {
            const novosDados = {
                titulo: tarefa.titulo,
                descricao: tarefa.descricao,
                dataVencimento: tarefa.dataVencimento,
                prioridade: tarefa.prioridade,
                cor: tarefa.cor,
                projetoId: novoProjeto.id
            };
            criaTarefa(novosDados);
        });
        salvaDados(getTasks(), getProjects());
        renderizaProjetos();
        logInfo(`Projeto ${projectId} duplicado com ID ${novoProjeto.id}.`);
    }
}

/**
 * Exclui um projeto da UI.
 * @param {number} projectId - O ID do projeto.
 */
export function excluiProjetoNaUI(projectId) {
    if (confirm('Excluir este projeto também excluirá todas as tarefas associadas. Continuar?')) {
        excluiProjeto(projectId);
        salvaDados(getTasks(), getProjects());
        renderizaProjetos();
        const projects = getProjects();
        if (projects.length > 0) {
            defineProjetoAtivoNaUI(projects[0].id);
        } else {
            tasksContainer.innerHTML = '<p style="text-align: center; color: #777;">Sem tarefas.</p>';
            postItSection.innerHTML = '<p class="no-task-selected">Selecione uma tarefa para ver os detalhes.</p>';
        }
        logInfo(`Projeto ${projectId} excluído.`);
    }
}

/**
 * Fecha um modal específico.
 * @param {string} modalId - O ID do modal a ser fechado ('taskModal' ou 'projectModal').
 */
export function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

/**
 * Alterna o status de conclusão de uma tarefa.
 * @param {number} taskId - O ID da tarefa.
 * @param {Event} event - O evento de clique para parar a propagação.
 */
export function toggleTaskCompletion(taskId, event) {
    event.stopPropagation();
    
    const tarefa = getTarefa(taskId);
    if (tarefa) {
        const novosDados = { ...tarefa, concluida: !tarefa.concluida };
        atualizaTarefa(taskId, novosDados);
        salvaDados(getTasks(), getProjects());
        renderizaTarefas();
        logInfo(`Tarefa ${taskId} status de conclusão alterado para ${novosDados.concluida}.`);
    }
}

/**
 * Define o filtro de exibição de tarefas.
 * @param {string} filter - O tipo de filtro ('all', 'pending', 'completed').
 */
export function setFilter(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id.includes(filter)) {
            btn.classList.add('active');
        }
    });

    renderizaTarefas();
    logInfo(`Filtro de tarefas alterado para: ${filter}`);
}