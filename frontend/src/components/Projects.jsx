// Projects.jsx - VERSIÓN MEJORADA
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NUEVOS STATES PARA ETAPAS Y TAREAS
  const [stages, setStages] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [availableProgrammers, setAvailableProgrammers] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [projectsRes, tasksRes, programmersRes] = await Promise.all([
        fetch('http://localhost:8000/api/projects/'),
        fetch('http://localhost:8000/api/tasks/'),
        fetch('http://localhost:8000/api/programmers/')
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

  // FUNCIÓN PARA AGREGAR NUEVA ETAPA
  const addNewStage = () => {
    const newStage = {
      id: Date.now(), // ID temporal para React
      name: '',
      description: '',
      order_index: stages.length,
      project_tasks: []
    };
    setStages([...stages, newStage]);
  };

  // FUNCIÓN PARA ACTUALIZAR ETAPA
  const updateStage = (index, field, value) => {
    const updatedStages = [...stages];
    updatedStages[index][field] = value;
    setStages(updatedStages);
  };

  // FUNCIÓN PARA ELIMINAR ETAPA
  const removeStage = (index) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    // Reordenar los índices
    updatedStages.forEach((stage, idx) => {
      stage.order_index = idx;
    });
    setStages(updatedStages);
  };

  // FUNCIÓN PARA AGREGAR TAREA A ETAPA
  const addTaskToStage = (stageIndex) => {
    const updatedStages = [...stages];
    const newTask = {
      id: Date.now() + Math.random(), // ID temporal único
      task_id: '',
      programmer_id: '',
      status: 'pending'
    };
    updatedStages[stageIndex].project_tasks.push(newTask);
    setStages(updatedStages);
  };

  // FUNCIÓN PARA ACTUALIZAR TAREA EN ETAPA
  const updateTaskInStage = (stageIndex, taskIndex, field, value) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].project_tasks[taskIndex][field] = value;
    setStages(updatedStages);
  };

  // FUNCIÓN PARA ELIMINAR TAREA DE ETAPA
  const removeTaskFromStage = (stageIndex, taskIndex) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].project_tasks = updatedStages[stageIndex].project_tasks.filter(
      (_, i) => i !== taskIndex
    );
    setStages(updatedStages);
  };

  // FUNCIÓN PRINCIPAL PARA GUARDAR PROYECTO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // DEBUG: Ver qué se va a enviar
  console.log('Datos a enviar:', {
    name,
    description,
    startDate,
    endDate,
    stages: stages.map(stage => ({
      name: stage.name,
      description: stage.description,
      order_index: stage.order_index,
      project_tasks: stage.project_tasks.map(task => ({
        task_id: task.task_id,
        programmer_id: task.programmer_id,
        status: task.status
      }))
    }))
  });
  
    // Validaciones básicas
    if (!name.trim()) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    try {
      // 1. PRIMERO: Crear el proyecto base
      const projectData = {
        name,
        description,
        start_date: startDate || null,
        end_date: endDate || null
        // responsible_id: null // Temporalmente comentado hasta arreglar la BD
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `http://localhost:8000/api/projects/${editingId}` : 'http://localhost:8000/api/projects/';
      
      const projectResponse = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!projectResponse.ok) throw new Error('Error al guardar proyecto');

      const savedProject = await projectResponse.json();
      const projectId = savedProject.id;

      // 2. SEGUNDO: Crear las etapas SOLO SI HAY ETAPAS
    if (stages.length > 0) {
      for (const stage of stages) {
        // Validar que la etapa tenga nombre
        if (!stage.name.trim()) {
          console.warn('Etapa sin nombre, omitiendo...');
          continue;
        }

        const stageResponse = await fetch('http://localhost:8000/api/stages/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            name: stage.name,
            description: stage.description,
            order_index: stage.order_index
          })
        });

        if (!stageResponse.ok) throw new Error('Error al crear etapa');

        const savedStage = await stageResponse.json();
        const stageId = savedStage.id;

        // 3. TERCERO: Crear las tareas de cada etapa
        if (stage.project_tasks && stage.project_tasks.length > 0) {
          for (const task of stage.project_tasks) {
            // Validar que la tarea tenga task_id
            if (!task.task_id) {
              console.warn('Tarea sin task_id, omitiendo...');
              continue;
            }

            await fetch('http://localhost:8000/api/project-tasks/', {
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

      // Recargar la lista de proyectos
      await loadInitialData();
      
      // Limpiar el formulario
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setStages([]);
      setEditingId(null);

      alert('Proyecto guardado exitosamente!');

    } catch (err) {
      setError('Error al guardar proyecto: ' + err.message);
    }
  };

  // FUNCIÓN PARA CARGAR DATOS DE PROYECTO EXISTENTE AL EDITAR
  const handleEdit = async (project) => {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description);
    setStartDate(project.start_date || '');
    setEndDate(project.end_date || '');
    
    try {
      // Cargar detalles completos del proyecto
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}`);
      if (response.ok) {
        const projectDetails = await response.json();
        setStages(projectDetails.stages || []);
      }
    } catch (err) {
      console.error('Error al cargar detalles del proyecto:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${id}`, { method: 'DELETE' });
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

  if (loading) return <div className="text-center p-4">Cargando proyectos...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestión de Proyectos</h1>
      
      {/* FORMULARIO MEJORADO */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6">{editingId ? 'Editar' : 'Crear'} Proyecto</h2>
        
        {/* DATOS BÁSICOS DEL PROYECTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del Proyecto *</label>
            <input
              type="text"
              placeholder="Nombre del Proyecto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
            <input
              type="text"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Fecha de Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Fecha de Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* SECCIÓN DE ETAPAS */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Etapas del Proyecto</h3>
            <button
              type="button"
              onClick={addNewStage}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Agregar Etapa
            </button>
          </div>

          {stages.map((stage, stageIndex) => (
            <div key={stage.id} className="border border-gray-300 rounded p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-medium">Etapa {stageIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeStage(stageIndex)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Eliminar Etapa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de la Etapa *</label>
                  <input
                    type="text"
                    placeholder="Nombre de la etapa"
                    value={stage.name}
                    onChange={(e) => updateStage(stageIndex, 'name', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción de la etapa"
                    value={stage.description}
                    onChange={(e) => updateStage(stageIndex, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* TAREAS DE LA ETAPA */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium">Tareas de esta etapa</h5>
                  <button
                    type="button"
                    onClick={() => addTaskToStage(stageIndex)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    + Agregar Tarea
                  </button>
                </div>

                {stage.project_tasks.map((task, taskIndex) => (
                  <div key={task.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-3 bg-white rounded border">
                    <select
                      value={task.task_id}
                      onChange={(e) => updateTaskInStage(stageIndex, taskIndex, 'task_id', e.target.value)}
                      className="p-2 border rounded"
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
                      className="p-2 border rounded"
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
                      className="p-2 border rounded"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completada</option>
                    </select>

                   <button
                      type="button"
                      onClick={() => removeTaskFromStage(stageIndex, taskIndex)}
                      className="bg-red-500 text-white rounded text-sm hover:bg-red-600 px-3 py-1 justify-self-start w-fit"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? 'Actualizar' : 'Guardar'} Proyecto
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => {
                setEditingId(null);
                setStages([]);
                setName('');
                setDescription('');
                setStartDate('');
                setEndDate('');
              }} 
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* LISTA DE PROYECTOS (se mantiene igual) */}
      <div className="bg-white rounded shadow-md p-4">
        <h2 className="text-2xl font-bold mb-4">Lista de Proyectos</h2>
        {projects && projects.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Descripción</th>
                <th className="py-2 px-4 border-b">Inicio</th>
                <th className="py-2 px-4 border-b">Fin</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td className="py-2 px-4 border-b text-center">
                    <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                      {project.name}
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b text-center">{project.description}</td>
                  <td className="py-2 px-4 border-b text-center">{project.start_date}</td>
                  <td className="py-2 px-4 border-b text-center">{project.end_date}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <button 
                      onClick={() => handleEdit(project)} 
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)} 
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center p-4">No hay proyectos disponibles</p>
        )}
      </div>
    </div>
  );
}

export default Projects;