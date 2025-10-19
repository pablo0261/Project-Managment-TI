// Tasks.jsx - VERSIÓN MEJORADA CON MODAL
import React, { useState, useEffect } from 'react';

// Componente Modal para Tareas
const TaskModal = ({ isOpen, onClose, task, onSave, isEditing }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('development');
  const [baseTimeHours, setBaseTimeHours] = useState('');

  // Cargar datos cuando el modal se abre o cambia la tarea
  useEffect(() => {
    if (isEditing && task) {
      setName(task.name);
      setDescription(task.description);
      setType(task.type);
      setBaseTimeHours(task.base_time_hours.toString());
    } else {
      // Resetear para nueva tarea
      setName('');
      setDescription('');
      setType('development');
      setBaseTimeHours('');
    }
  }, [isOpen, task, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      type,
      base_time_hours: parseFloat(baseTimeHours)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar' : 'Agregar'} Tarea
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nombre de la Tarea *
              </label>
              <input
                type="text"
                placeholder="Ej: Desarrollo de API REST"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Descripción Detallada *
              </label>
              <textarea
                placeholder="Describe detalladamente lo que debe realizarse en esta tarea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Explica todo lo que debe ser realizado, incluyendo requisitos específicos y criterios de aceptación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo de Tarea *
                </label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="development">Desarrollo</option>
                  <option value="management">Gestión</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tiempo Base (Horas) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="100"
                  placeholder="Ej: 8.5"
                  value={baseTimeHours}
                  onChange={(e) => setBaseTimeHours(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tiempo estimado en horas para completar la tarea
                </p>
              </div>
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
              {isEditing ? 'Actualizar' : 'Guardar'} Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal Tasks
function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/');
      if (!response.ok) throw new Error('Error al cargar tareas');
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar tareas: ' + err.message);
      setLoading(false);
    }
  };

  // Abrir modal para crear nueva tarea
  const handleCreateNew = () => {
    setEditingTask(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  // Abrir modal para editar tarea
  const handleEdit = (task) => {
    setEditingTask(task);
    setIsEditing(true);
    setModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  // Guardar tarea (crear o actualizar)
  const handleSaveTask = async (taskData) => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:8000/api/tasks/${editingTask.id}`
        : 'http://localhost:8000/api/tasks/';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const savedTask = await response.json();
        
        if (isEditing) {
          // Actualizar en la lista
          setTasks(tasks.map(t => 
            t.id === editingTask.id ? savedTask : t
          ));
        } else {
          // Agregar nuevo a la lista
          setTasks([...tasks, savedTask]);
        }
        
        handleCloseModal();
      } else {
        throw new Error('Error al guardar tarea');
      }
    } catch (err) {
      setError('Error al guardar tarea: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/tasks/${id}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          setTasks(tasks.filter(t => t.id !== id));
        } else {
          throw new Error('Error al eliminar tarea');
        }
      } catch (err) {
        setError('Error al eliminar tarea: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center p-8">Cargando tareas...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
            <p className="text-gray-600 mt-2">
              Administra el catálogo de tareas disponibles para los proyectos
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Nueva Tarea
          </button>
        </div>

        {/* Modal */}
        <TaskModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          task={editingTask}
          onSave={handleSaveTask}
          isEditing={isEditing}
        />

        {/* Lista de Tareas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Catálogo de Tareas ({tasks.length})
            </h2>
          </div>

          {tasks && tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                      Horas Base
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {task.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-md">
                          {task.description || (
                            <span className="text-gray-400 italic">
                              Sin descripción
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${task.type === 'development' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.type === 'development' ? 'Desarrollo' : 'Gestión'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {task.base_time_hours}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(task)}
                            className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-yellow-700 bg-yellow-50 rounded text-sm hover:bg-yellow-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-700 bg-red-50 rounded text-sm hover:bg-red-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay tareas</h3>
              <p className="mt-1 text-gray-500">Comienza creando tu primera tarea.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primera Tarea
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Tareas de Desarrollo</h3>
            <p className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.type === 'development').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">Tareas de Gestión</h3>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.type === 'management').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Horas Totales</h3>
            <p className="text-2xl font-bold text-purple-600">
              {tasks.reduce((total, task) => total + parseFloat(task.base_time_hours), 0).toFixed(1)}h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;