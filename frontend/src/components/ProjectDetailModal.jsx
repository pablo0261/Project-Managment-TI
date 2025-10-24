import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Componente Modal para Ver Detalles (Solo Lectura)
const ProjectDetailModal = ({ isOpen, onClose, project, availableTasks, availableProgrammers }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Detalles del Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-6">
            {/* DATOS BÁSICOS DEL PROYECTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nombre del Proyecto
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  {project.name}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Descripción
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  {project.description || <span className="text-gray-400 italic">Sin descripción</span>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fecha de Inicio
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  {project.start_date || '-'}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fecha de Fin
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  {project.end_date || '-'}
                </div>
              </div>
            </div>

            {/* SECCIÓN DE ETAPAS */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Etapas del Proyecto ({project.stages?.length || 0})
              </h3>

              {project.stages && project.stages.length > 0 ? (
                project.stages.map((stage, stageIndex) => (
                  <div key={stage.id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-800">
                        Etapa {stageIndex + 1}: {stage.name}
                      </h4>
                      <p className="text-gray-600 mt-1">{stage.description}</p>
                      <p className="text-sm text-gray-500 mt-1">Orden: {stage.order_index}</p>
                    </div>

                    {/* TAREAS DE LA ETAPA */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">
                        Tareas de esta etapa ({stage.project_tasks?.length || 0})
                      </h5>

                      {stage.project_tasks && stage.project_tasks.length > 0 ? (
                        <div className="space-y-3">
                          {stage.project_tasks.map((task, taskIndex) => (
                            <div key={task.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white rounded border">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Tarea</label>
                                <div className="p-2 border rounded text-sm bg-gray-50">
                                  {task.task?.name || 'Tarea no encontrada'}
                                  {task.task?.base_time_hours && ` (${task.task.base_time_hours}h)`}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Programador</label>
                                <div className="p-2 border rounded text-sm bg-gray-50">
                                  {task.programmer ? 
                                    `${task.programmer.name} (${task.programmer.seniority})` : 
                                    'Sin asignar'
                                  }
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Estado</label>
                                <div className="p-2 border rounded text-sm bg-gray-50 capitalize">
                                  {task.status || 'pending'}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Horas Calculadas</label>
                                <div className="p-2 border rounded text-sm bg-gray-50">
                                  {task.calculated_total_hours ? 
                                    `${task.calculated_total_hours.toFixed(2)}h` : 
                                    'N/A'
                                  }
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4 bg-white rounded border">
                          No hay tareas en esta etapa
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8 bg-gray-50 rounded border">
                  No hay etapas en este proyecto
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};