import React, { useState, useEffect } from 'react';

// Componente Modal separado
const ProgrammerModal = ({ isOpen, onClose, programmer, onSave, isEditing }) => {
  const [name, setName] = useState('');
  const [seniority, setSeniority] = useState('Junior');
  const [coefficient, setCoefficient] = useState('1.75');

  // Cargar datos cuando el modal se abre o cambia el programador
  useEffect(() => {
    if (isEditing && programmer) {
      setName(programmer.name);
      setSeniority(programmer.seniority);
      setCoefficient(programmer.coefficient.toString());
    } else {
      // Resetear para nuevo programador
      setName('');
      setSeniority('Junior');
      setCoefficient('1.75');
    }
  }, [isOpen, programmer, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      seniority,
      coefficient: parseFloat(coefficient)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar' : 'Agregar'} Programador
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nombre *
              </label>
              <input
                type="text"
                placeholder="Nombre del programador"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Seniority *
              </label>
              <select 
                value={seniority} 
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Junior">Junior</option>
                <option value="Pleno">Pleno</option>
                <option value="Senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="PM">PM</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Coeficiente *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="3.0"
                placeholder="Coeficiente"
                value={coefficient}
                onChange={(e) => setCoefficient(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal Programmers
function Programmers() {
  const [programmers, setProgrammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgrammer, setEditingProgrammer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProgrammers();
  }, []);

  const loadProgrammers = async () => {
    try {
      console.log('Cargando programadores...'); 
      const response = await fetch('http://localhost:8000/api/programmers/');
      if (!response.ok) throw new Error('Error al cargar programadores');
      const data = await response.json();
      console.log('Programadores cargados:', data); 
      setProgrammers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err); 
      setError('Error al cargar programadores: ' + err.message);
      setLoading(false);
    }
  };
  
 // FUNCIÓN PARA OBTENER COLOR SEGÚN CANTIDAD DE PROYECTOS - CORREGIDA
  const getProjectCountColor = (count) => {
    if (count === 0) return 'bg-gray-100 text-gray-800';
    if (count <= 2) return 'bg-green-100 text-green-800';
    if (count <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // FUNCIÓN PARA OBTENER COLOR DE ICONO - CORREGIDA
  const getProjectCountIconColor = (count) => {
    if (count === 0) return 'text-gray-500';
    if (count <= 2) return 'text-green-500';
    if (count <= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Abrir modal para crear nuevo
  const handleCreateNew = () => {
    setEditingProgrammer(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (programmer) => {
    setEditingProgrammer(programmer);
    setIsEditing(true);
    setModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProgrammer(null);
  };

  // Guardar programador (crear o actualizar)
  const handleSaveProgrammer = async (programmerData) => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:8000/api/programmers/${editingProgrammer.id}`
        : 'http://localhost:8000/api/programmers/';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programmerData),
      });
      
      if (response.ok) {
        const savedProgrammer = await response.json();
        
        if (isEditing) {
          // Actualizar en la lista
          setProgrammers(programmers.map(p => 
            p.id === editingProgrammer.id ? savedProgrammer : p
          ));
        } else {
          // Agregar nuevo a la lista
          setProgrammers([...programmers, savedProgrammer]);
        }
        
        handleCloseModal();
      } else {
        throw new Error('Error al guardar programador');
      }
    } catch (err) {
      setError('Error al guardar programador: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este programador?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/programmers/${id}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          setProgrammers(programmers.filter(p => p.id !== id));
        } else {
          throw new Error('Error al eliminar programador');
        }
      } catch (err) {
        setError('Error al eliminar programador: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center p-4">Cargando programadores...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

 // Calcular estadísticas CORREGIDAS
  const totalProgrammers = programmers.length;
  const assignedProgrammers = programmers.filter(p => p.project_count > 0).length;
  const unassignedProgrammers = programmers.filter(p => p.project_count === 0).length;
  const averageProjects = totalProgrammers > 0 
    ? (programmers.reduce((sum, p) => sum + p.project_count, 0) / totalProgrammers).toFixed(1)
    : '0.0';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Programadores</h1>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Agregar Programador
        </button>
      </div>

      {/* Modal */}
      <ProgrammerModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        programmer={editingProgrammer}
        onSave={handleSaveProgrammer}
        isEditing={isEditing}
      />

      {/* Lista de programadores - TABLA MEJORADA */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Lista de Programadores</h2>
          {programmers && programmers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Seniority</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Coeficiente</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Proyectos Activos</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {programmers.map(programmer => (
                    <tr key={programmer.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {programmer.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${programmer.seniority === 'Junior' ? 'bg-green-100 text-green-800' : ''}
                          ${programmer.seniority === 'Pleno' ? 'bg-blue-100 text-blue-800' : ''}
                          ${programmer.seniority === 'Senior' ? 'bg-purple-100 text-purple-800' : ''}
                          ${programmer.seniority === 'lead' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${programmer.seniority === 'PM' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {programmer.seniority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-700">
                          {programmer.coefficient}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                            ${programmer.project_count === 0 
                              ? 'bg-gray-100 text-gray-800' 
                              : programmer.project_count <= 2
                                ? 'bg-green-100 text-green-800'
                                : programmer.project_count <= 4
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <svg 
                              className={`w-4 h-4 mr-1 ${
                                programmer.project_count === 0 ? 'text-gray-500' :
                                programmer.project_count <= 2 ? 'text-green-500' :
                                programmer.project_count <= 4 ? 'text-yellow-500' : 'text-red-500'
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {programmer.project_count} proyecto{programmer.project_count !== 1 ? 's' : ''}
                          </span>
                          
                          {/* Tooltip informativo */}
                          {programmer.project_count > 4 && (
                            <span 
                              className="ml-2 text-xs text-red-600 font-medium"
                              title="Este programador está asignado a muchos proyectos"
                            >
                              ¡Muy ocupado!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
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
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay programadores disponibles</p>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Crear Primer Programador
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Programadores</h3>
          <p className="text-2xl font-bold text-gray-800">{programmers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">En Proyectos</h3>
          <p className="text-2xl font-bold text-green-600">
            {programmers.filter(p => p.project_count > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Sin Asignar</h3>
          <p className="text-2xl font-bold text-gray-500">
            {programmers.filter(p => p.project_count === 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Promedio de Proyectos</h3>
          <p className="text-2xl font-bold text-blue-600">
            {(programmers.reduce((sum, p) => sum + p.project_count, 0) / programmers.length || 0).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Programmers;