import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ProjectDetail() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [availableProgrammers, setAvailableProgrammers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State para la nueva etapa
    const [newStageName, setNewStageName] = useState('');
    const [newStageDescription, setNewStageDescription] = useState('');
    const [newStageOrderIndex, setNewStageOrderIndex] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchProjectDetails(),
                fetchAvailableTasks(),
                fetchAvailableProgrammers()
            ]);
            setLoading(false);
        };
        loadData();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
            setProject(response.data);
        } catch (err) {
            setError(err);
            console.error("Error fetching project details:", err);
        }
    };

    const fetchAvailableTasks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/tasks/');
            setAvailableTasks(response.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    };

    const fetchAvailableProgrammers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/programmers/');
            setAvailableProgrammers(response.data);
        } catch (err) {
            console.error("Error fetching programmers:", err);
        }
    };

    const handleCreateStage = async (e) => {
        e.preventDefault();
        if (!newStageName.trim()) {
            alert('El nombre de la etapa no puede estar vacío.');
            return;
        }
        try {
            await axios.post('http://localhost:8000/api/stages/', {
                project_id: parseInt(projectId),
                name: newStageName,
                description: newStageDescription,
                order_index: parseInt(newStageOrderIndex)
            });
            setNewStageName('');
            setNewStageDescription('');
            setNewStageOrderIndex(0);
            fetchProjectDetails(); // Refrescar los detalles del proyecto
        } catch (err) {
            console.error("Error creating stage:", err);
            alert('Error al crear la etapa. Verifique que el nombre no esté duplicado en este proyecto.');
        }
    };

    const handleAddTaskToStage = async (stageId, taskId, programmerId) => {
        if (!taskId) {
            alert('Por favor, selecciona una tarea.');
            return;
        }
        try {
            await axios.post('http://localhost:8000/api/project-tasks/', {
                stage_id: stageId,
                task_id: parseInt(taskId),
                programmer_id: programmerId ? parseInt(programmerId) : null,
                status: "pending"
            });
            fetchProjectDetails(); // Refrescar los detalles del proyecto
        } catch (err) {
            console.error("Error adding task:", err);
            alert('Error al agregar tarea a la etapa.');
        }
    };

    const handleDeleteProjectTask = async (projectTaskId) => {
        if (window.confirm('¿Estás seguro de que quieres remover esta tarea de la etapa?')) {
            try {
                await axios.delete(`http://localhost:8000/api/project-tasks/${projectTaskId}`);
                fetchProjectDetails(); // Refrescar los detalles del proyecto
            } catch (err) {
                console.error("Error deleting task:", err);
                alert('Error al eliminar la tarea.');
            }
        }
    };

    const handleUpdateProjectTaskProgrammer = async (projectTaskId, newProgrammerId) => {
        try {
            await axios.put(`http://localhost:8000/api/project-tasks/${projectTaskId}`, {
                programmer_id: newProgrammerId ? parseInt(newProgrammerId) : null
            });
            fetchProjectDetails(); // Refrescar los detalles del proyecto
        } catch (err) {
            console.error("Error updating programmer:", err);
            alert('Error al actualizar el programador.');
        }
    };

    const handleDeleteStage = async (stageId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta etapa y todas sus tareas asociadas?')) {
            try {
                await axios.delete(`http://localhost:8000/api/stages/${stageId}`);
                fetchProjectDetails();
            } catch (err) {
                console.error("Error deleting stage:", err);
                alert('Error al eliminar la etapa.');
            }
        }
    };

    if (loading) return <div className="text-center p-4">Cargando proyecto...</div>;
    if (error) return <div className="text-red-500 text-center p-4">Error: {error.message}</div>;
    if (!project) return <div className="text-center p-4">Proyecto no encontrado.</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Proyecto: {project.name}</h1>
            <p className="mb-2">Descripción: {project.description}</p>
            <p className="mb-2">Fecha de Inicio: {project.start_date}</p>
            <p className="mb-2">Fecha de Fin: {project.end_date}</p>
            <p className="mb-4">Responsable: {project.responsible ? project.responsible.name : 'N/A'}</p>

            <div className="bg-white rounded shadow-md p-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">Tiempo Total del Proyecto: {project.total_estimated_hours ? project.total_estimated_hours.toFixed(2) : '0.00'} horas</h2>
            </div>

            {/* Formulario para agregar nueva etapa */}
            <div className="mb-8 p-4 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4">Agregar Nueva Etapa</h2>
                <form onSubmit={handleCreateStage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Nombre de la Etapa"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Descripción de la Etapa (Opcional)"
                        value={newStageDescription}
                        onChange={(e) => setNewStageDescription(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Orden (ej. 0, 1, 2)"
                        value={newStageOrderIndex}
                        onChange={(e) => setNewStageOrderIndex(e.target.value)}
                        className="p-2 border rounded"
                        min="0"
                    />
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Crear Etapa
                    </button>
                </form>
            </div>

            <div className="bg-white rounded shadow-md p-4">
                <h2 className="text-2xl font-bold mb-4">Etapas del Proyecto</h2>
                {project.stages && project.stages.length > 0 ? (
                    project.stages.map(stage => (
                        <div key={stage.id} className="border border-gray-200 rounded p-4 mb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{stage.name} (Orden: {stage.order_index})</h3>
                                    <p className="text-gray-600">{stage.description}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteStage(stage.id)}
                                    className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                    title="Eliminar etapa"
                                >
                                    ×
                                </button>
                            </div>

                            <h4 className="text-lg font-medium mb-2">Tareas de la Etapa</h4>
                            {stage.project_tasks && stage.project_tasks.length > 0 ? (
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">Tarea</th>
                                            <th className="py-2 px-4 border-b text-left">Descripción</th>
                                            <th className="py-2 px-4 border-b text-left">Tiempo Base (h)</th>
                                            <th className="py-2 px-4 border-b text-left">Programador Asignado</th>
                                            <th className="py-2 px-4 border-b text-left">Horas Calculadas</th>
                                            <th className="py-2 px-4 border-b text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stage.project_tasks.map(pt => (
                                            <tr key={pt.id} className="border-t">
                                                <td className="py-2 px-4">{pt.task.name}</td>
                                                <td className="py-2 px-4">{pt.task.description}</td>
                                                <td className="py-2 px-4">{pt.task.base_time_hours}</td>
                                                <td className="py-2 px-4">
                                                    <select
                                                        value={pt.programmer ? pt.programmer.id : ''}
                                                        onChange={(e) => handleUpdateProjectTaskProgrammer(pt.id, e.target.value)}
                                                        className="p-1 border rounded text-sm"
                                                    >
                                                        <option value="">Sin Asignar</option>
                                                        {availableProgrammers.map(prog => (
                                                            <option key={prog.id} value={prog.id}>{prog.name} ({prog.seniority})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2 px-4">{pt.calculated_total_hours ? pt.calculated_total_hours.toFixed(2) : 'N/A'}</td>
                                                <td className="py-2 px-4">
                                                    <button 
                                                        onClick={() => handleDeleteProjectTask(pt.id)}
                                                        className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                                        title="Eliminar tarea"
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500">No hay tareas en esta etapa.</p>
                            )}

                            {/* Formulario para agregar tarea a esta etapa */}
                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <h5 className="text-md font-medium mb-2">Agregar Tarea a esta Etapa</h5>
                                <div className="flex flex-wrap gap-2">
                                    <select
                                        id={`task-select-${stage.id}`}
                                        className="p-2 border rounded flex-grow"
                                    >
                                        <option value="">Seleccionar Tarea</option>
                                        {availableTasks.map(task => (
                                            <option key={task.id} value={task.id}>{task.name} ({task.base_time_hours}h)</option>
                                        ))}
                                    </select>
                                    <select
                                        id={`programmer-select-${stage.id}`}
                                        className="p-2 border rounded flex-grow"
                                    >
                                        <option value="">Asignar Programador (Opcional)</option>
                                        {availableProgrammers.map(prog => (
                                            <option key={prog.id} value={prog.id}>{prog.name} ({prog.seniority})</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleAddTaskToStage(
                                            stage.id,
                                            document.getElementById(`task-select-${stage.id}`).value,
                                            document.getElementById(`programmer-select-${stage.id}`).value
                                        )}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Agregar Tarea
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No hay etapas en este proyecto.</p>
                )}
            </div>
        </div>
    );
}

export default ProjectDetail;