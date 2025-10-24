import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/// Componente Modal para Ver Detalles (Solo Lectura)
const ProjectDetailModal = ({ isOpen, onClose, project, availableTasks, availableProgrammers }) => {
  if (!isOpen || !project) return null;

  // Función para traducir estado al español
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'completed': 'Completada'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Detalles del Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
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
                <div className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 font-medium text-gray-800">
                  {project.name}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Descripción
                </label>
                <div className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                  {project.description || <span className="text-gray-400 italic">Sin descripción</span>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  📅 Fecha de Inicio
                </label>
                <div className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 font-medium">
                  {project.start_date || <span className="text-gray-400">No definida</span>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  🏁 Fecha de Fin
                </label>
                <div className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 font-medium">
                  {project.end_date || <span className="text-gray-400">No definida</span>}
                </div>
              </div>
            </div>

            {/* TIEMPO TOTAL ESTIMADO */}
            {project.total_estimated_hours !== undefined && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">⏱️</span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-600 uppercase">Tiempo Total Estimado</h3>
                      <p className="text-3xl font-bold text-purple-700">{project.total_estimated_hours.toFixed(2)} horas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Calculado con coeficientes</p>
                    <p className="text-xs text-gray-500">de programadores</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN DE ETAPAS */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Etapas del Proyecto
                  <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                    {project.stages?.length || 0}
                  </span>
                </h3>
              </div>

              {project.stages && project.stages.length > 0 ? (
                project.stages.map((stage, stageIndex) => (
                  <div key={stage.id} className="border-2 border-blue-200 rounded-lg p-5 mb-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                    <div className="mb-4 pb-3 border-b border-blue-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-blue-900 mb-2">
                            🔷 Etapa {stageIndex + 1}: {stage.name}
                          </h4>
                          <p className="text-gray-700">{stage.description || <span className="text-gray-400 italic">Sin descripción</span>}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          Orden: {stage.order_index}
                        </span>
                      </div>
                    </div>

                    {/* TAREAS DE LA ETAPA */}
                    <div>
                      <h5 className="font-bold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">✅</span>
                        Tareas de esta etapa
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          {stage.project_tasks?.length || 0}
                        </span>
                      </h5>

                      {stage.project_tasks && stage.project_tasks.length > 0 ? (
                        <div className="space-y-3">
                          {stage.project_tasks.map((task, taskIndex) => (
                            <div key={task.id} className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">📌 Tarea</label>
                                  <div className="p-2 border border-gray-300 rounded bg-gray-50 text-sm font-medium">
                                    {task.task?.name || 'Tarea no encontrada'}
                                  </div>
                                  {task.task?.base_time_hours && (
                                    <div className="mt-1 text-xs text-gray-600">
                                      ⏱️ Tiempo base: <span className="font-bold">{task.task.base_time_hours}h</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">👤 Programador</label>
                                  <div className="p-2 border border-gray-300 rounded bg-gray-50 text-sm">
                                    {task.programmer ? (
                                      <div>
                                        <div className="font-medium">{task.programmer.name}</div>
                                        <div className="text-xs text-gray-600">({task.programmer.seniority})</div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic">Sin asignar</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">📊 Estado</label>
                                  <div className={`p-2 border rounded text-sm font-semibold text-center ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                    'bg-gray-100 text-gray-800 border-gray-300'
                                  }`}>
                                    {translateStatus(task.status || 'pending')}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">⏰ Horas Calculadas</label>
                                  <div className="p-2 border border-gray-300 rounded bg-blue-50 text-sm font-bold text-blue-900 text-center">
                                    {task.calculated_total_hours ? 
                                      `${task.calculated_total_hours.toFixed(2)}h` : 
                                      <span className="text-gray-400">N/A</span>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-400 italic">No hay tareas en esta etapa</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500 font-medium">No hay etapas en este proyecto</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t-2 border-gray-200">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal para Proyectos (Editar/Crear)
const ProjectModal = ({ isOpen, onClose, project, onSave, isEditing, availableTasks, availableProgrammers }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stages, setStages] = useState([]);

  // Cargar datos cuando el modal se abre o cambia el proyecto
  useEffect(() => {
    if (isEditing && project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setStartDate(project.start_date || '');
      setEndDate(project.end_date || '');
      setStages(project.stages ? project.stages.map(stage => ({
        id: stage.id,
        name: stage.name || '',
        description: stage.description || '',
        order_index: stage.order_index,
        project_tasks: stage.project_tasks ? stage.project_tasks.map(pt => ({
          id: pt.id,
          task_id: pt.task ? pt.task.id : '',
          programmer_id: pt.programmer ? pt.programmer.id : '',
          status: pt.status || 'pending'
        })) : []
      })) : []);
    } else {
      // Resetear para nuevo proyecto
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setStages([]);
    }
  }, [isOpen, project, isEditing]);

  // FUNCIONES PARA MANEJAR ETAPAS
  const addNewStage = () => {
    const newStage = {
      id: Date.now(),
      name: '',
      description: '',
      order_index: stages.length,
      project_tasks: []
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (index, field, value) => {
    const updatedStages = [...stages];
    updatedStages[index][field] = value;
    setStages(updatedStages);
  };

  const removeStage = (index) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    updatedStages.forEach((stage, idx) => {
      stage.order_index = idx;
    });
    setStages(updatedStages);
  };

  // FUNCIONES PARA MANEJAR TAREAS
  const addTaskToStage = (stageIndex) => {
    const updatedStages = [...stages];
    const newTask = {
      id: Date.now() + Math.random(),
      task_id: '',
      programmer_id: '',
      status: 'pending'
    };
    updatedStages[stageIndex].project_tasks.push(newTask);
    setStages(updatedStages);
  };

  const updateTaskInStage = (stageIndex, taskIndex, field, value) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].project_tasks[taskIndex][field] = value;
    setStages(updatedStages);
  };

  const removeTaskFromStage = (stageIndex, taskIndex) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].project_tasks = updatedStages[stageIndex].project_tasks.filter(
      (_, i) => i !== taskIndex
    );
    setStages(updatedStages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    // Validar que todas las etapas tengan nombre
    for (const stage of stages) {
      if (!stage.name.trim()) {
        alert('Todas las etapas deben tener un nombre');
        return;
      }
    }

    onSave({
      name,
      description,
      start_date: startDate || null,
      end_date: endDate || null,
      stages: stages.map(stage => ({
        ...stage,
        project_tasks: stage.project_tasks.map(task => ({
          task_id: task.task_id,
          programmer_id: task.programmer_id,
          status: task.status
        }))
      }))
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar' : 'Crear'} Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-6">
            {/* DATOS BÁSICOS DEL PROYECTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Descripción del proyecto"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* SECCIÓN DE ETAPAS */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Etapas del Proyecto</h3>
                <button
                  type="button"
                  onClick={addNewStage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Agregar Etapa
                </button>
              </div>

              {stages.map((stage, stageIndex) => (
                <div key={stage.id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-800">Etapa {stageIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeStage(stageIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Eliminar Etapa
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre de la Etapa *
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre de la etapa"
                        value={stage.name}
                        onChange={(e) => updateStage(stageIndex, 'name', e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Descripción
                      </label>
                      <input
                        type="text"
                        placeholder="Descripción de la etapa"
                        value={stage.description}
                        onChange={(e) => updateStage(stageIndex, 'description', e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* TAREAS DE LA ETAPA */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Tareas de esta etapa</h5>
                      <button
                        type="button"
                        onClick={() => addTaskToStage(stageIndex)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        + Agregar Tarea
                      </button>
                    </div>

                    {stage.project_tasks.map((task, taskIndex) => (
                      <div key={task.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-white rounded border">
                        <select
                          value={task.task_id}
                          onChange={(e) => updateTaskInStage(stageIndex, taskIndex, 'task_id', e.target.value)}
                          className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Seleccionar Tarea</option>
                          {availableTasks.map(availableTask => (
                            <option key={availableTask.id} value={availableTask.id}>
                              {availableTask.name} ({availableTask.base_time_hours}h)
                            </option>
                          ))}
                        </select>

                        <select
                          value={task.programmer_id}
                          onChange={(e) => updateTaskInStage(stageIndex, taskIndex, 'programmer_id', e.target.value)}
                          className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Sin asignar</option>
                          {availableProgrammers.map(programmer => (
                            <option key={programmer.id} value={programmer.id}>
                              {programmer.name} ({programmer.seniority})
                            </option>
                          ))}
                        </select>

                        <select
                          value={task.status}
                          onChange={(e) => updateTaskInStage(stageIndex, taskIndex, 'status', e.target.value)}
                          className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="completed">Completada</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => removeTaskFromStage(stageIndex, taskIndex)}
                          className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Actualizar' : 'Guardar'} Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL PROJECTS
function Projects() {
  const [projects, setProjects] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [availableProgrammers, setAvailableProgrammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para los modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [projectsRes, tasksRes, programmersRes] = await Promise.all([
        fetch('/api/projects/'),
        fetch('/api/tasks/'),
        fetch('/api/programmers/')
      ]);

      if (!projectsRes.ok || !tasksRes.ok || !programmersRes.ok) {
        throw new Error('Error al cargar datos iniciales');
      }

      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      const programmersData = await programmersRes.json();

      setProjects(projectsData);
      setAvailableTasks(tasksData);
      setAvailableProgrammers(programmersData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
      setLoading(false);
    }
  };

  // Abrir modal para crear nuevo proyecto
  const handleCreateNew = () => {
    setEditingProject(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  // Abrir modal para editar proyecto
  const handleEdit = async (project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`);
      if (response.ok) {
        const projectDetails = await response.json();
        setEditingProject(projectDetails);
        setIsEditing(true);
        setModalOpen(true);
      } else {
        throw new Error('Error al cargar detalles del proyecto');
      }
    } catch (err) {
      setError('Error al cargar detalles del proyecto: ' + err.message);
    }
  };

  // Abrir modal para ver detalles del proyecto
  const handleViewDetails = async (project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/details`);
      if (response.ok) {
        const projectDetails = await response.json();
        setViewingProject(projectDetails);
        setDetailModalOpen(true);
      } else {
        throw new Error('Error al cargar detalles del proyecto');
      }
    } catch (err) {
      setError('Error al cargar detalles del proyecto: ' + err.message);
    }
  };

  // Cerrar modales
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setViewingProject(null);
  };

  // Guardar proyecto (crear o actualizar)
  const handleSaveProject = async (projectData) => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/projects/${editingProject.id}` : '/api/projects/';
      
      // 1. Guardar proyecto base
      const projectResponse = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          responsible_id: null
        })
      });

      if (!projectResponse.ok) throw new Error('Error al guardar proyecto');
      const savedProject = await projectResponse.json();
      const projectId = savedProject.id;

      // 2. Manejar etapas
      if (!isEditing) {
        // NUEVO: Crear etapas secuencialmente
        for (let i = 0; i < projectData.stages.length; i++) {
          const stage = projectData.stages[i];
          const stageResponse = await fetch('/api/stages/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              name: stage.name,
              description: stage.description,
              order_index: i
            })
          });
          if (!stageResponse.ok) throw new Error('Error al crear etapa');
          
          const savedStage = await stageResponse.json();
          const stageId = savedStage.id;

          // Crear tareas
          for (const task of stage.project_tasks) {
            if (task.task_id) {
              await fetch('/api/project-tasks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  stage_id: stageId,
                  task_id: parseInt(task.task_id),
                  programmer_id: task.programmer_id ? parseInt(task.programmer_id) : null,
                  status: task.status || 'pending'
                })
              });
            }
          }
        }
      } else {
        // EDITAR: Actualizar etapas existentes
        for (let i = 0; i < projectData.stages.length; i++) {
          const stage = projectData.stages[i];
          const stageId = stage.id;
          
          // Actualizar etapa
          await fetch(`/api/stages/${stageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: stage.name,
              description: stage.description,
              order_index: i
            })
          });

          // Eliminar tareas antiguas
          if (stage.project_tasks) {
            const oldTasks = await fetch(`/api/project-tasks/?stage_id=${stageId}`).then(r => r.json());
            for (const oldTask of oldTasks) {
              await fetch(`/api/project-tasks/${oldTask.id}`, { method: 'DELETE' });
            }
          }

          // Crear tareas nuevas
          for (const task of stage.project_tasks) {
            if (task.task_id) {
              await fetch('/api/project-tasks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  stage_id: stageId,
                  task_id: parseInt(task.task_id),
                  programmer_id: task.programmer_id ? parseInt(task.programmer_id) : null,
                  status: task.status || 'pending'
                })
              });
            }
          }
        }
      }

      await loadInitialData();
      handleCloseModal();
      alert(`Proyecto ${isEditing ? 'actualizado' : 'creado'} exitosamente!`);
    } catch (err) {
      setError('Error al guardar proyecto: ' + err.message);
      console.error('Error detallado:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setProjects(projects.filter(p => p.id !== id));
        } else {
          throw new Error('Error al eliminar proyecto');
        }
      } catch (err) {
        setError('Error al eliminar proyecto: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center p-8">Cargando proyectos...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
            <p className="text-gray-600 mt-2">
              Administra y organiza los proyectos con sus etapas y tareas
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Nuevo Proyecto
          </button>
        </div>

        {/* Modales */}
        <ProjectModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          project={editingProject}
          onSave={handleSaveProject}
          isEditing={isEditing}
          availableTasks={availableTasks}
          availableProgrammers={availableProgrammers}
        />

        <ProjectDetailModal
          isOpen={detailModalOpen}
          onClose={handleCloseDetailModal}
          project={viewingProject}
          availableTasks={availableTasks}
          availableProgrammers={availableProgrammers}
        />

        {/* Lista de Proyectos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Lista de Proyectos ({projects.length})
            </h2>
          </div>

          {projects && projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map(project => {
                    const status = project.end_date 
                      ? 'Completado' 
                      : (project.start_date ? 'En Curso' : 'Planificado');
                    const statusColor = project.end_date 
                      ? 'bg-green-100 text-green-800' 
                      : (project.start_date ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800');
                    
                    return (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                            {project.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-md">
                            {project.description || <span className="text-gray-400 italic">Sin descripción</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{project.start_date || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{project.end_date || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(project)} 
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-700 bg-blue-50 rounded text-sm hover:bg-blue-100 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Detalles
                            </button>
                            <button onClick={() => handleEdit(project)} className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-yellow-700 bg-yellow-50 rounded text-sm hover:bg-yellow-100 transition-colors">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button onClick={() => handleDelete(project.id)} className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-700 bg-red-50 rounded text-sm hover:bg-red-100 transition-colors">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay proyectos</h3>
              <p className="mt-1 text-gray-500">Comienza creando tu primer proyecto.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primer Proyecto
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Total Proyectos</h3>
            <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">En Curso</h3>
            <p className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.start_date && !p.end_date).length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Completados</h3>
            <p className="text-2xl font-bold text-purple-600">
              {projects.filter(p => p.end_date).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;