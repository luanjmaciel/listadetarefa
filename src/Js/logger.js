// src/js/logger.js

/**
 * @fileoverview Módulo para um sistema de logging básico.
 * @module logger
 */

const logLevels = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};

/**
 * Registra uma mensagem de informação no console.
 * @param {string} mensagem - A mensagem a ser logada.
 * @param {...any} dados - Dados adicionais para a mensagem.
 */
export function logInfo(mensagem, ...dados) {
    console.log(`[INFO] ${new Date().toLocaleTimeString()} - ${mensagem}`, ...dados);
}

/**
 * Registra uma mensagem de aviso no console.
 * @param {string} mensagem - A mensagem a ser logada.
 * @param {...any} dados - Dados adicionais para a mensagem.
 */
export function logWarn(mensagem, ...dados) {
    console.warn(`[WARN] ${new Date().toLocaleTimeString()} - ${mensagem}`, ...dados);
}

/**
 * Registra uma mensagem de erro no console.
 * @param {string} mensagem - A mensagem a ser logada.
 * @param {...any} dados - Dados adicionais para a mensagem.
 */
export function logError(mensagem, ...dados) {
    console.error(`[ERROR] ${new Date().toLocaleTimeString()} - ${mensagem}`, ...dados);
}