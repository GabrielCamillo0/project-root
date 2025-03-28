import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/Forminput';
import api from '../services/api';
import '../styles/Opportunities.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Modal, Button } from 'react-bootstrap';

// Define os estágios do pipeline (ajuste conforme o seu modelo)
const pipelineStages = ['new', 'negotiation', 'closed'];

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    value: '',
    stage: 'new',
    contact_id: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal para criação/edição
  const [isClient, setIsClient] = useState(false); // Garante que DnD só seja renderizado no cliente

  useEffect(() => {
    setIsClient(true);
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/opportunities');
      setOpportunities(res.data);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      setError('Error loading opportunities');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingId) {
      // Chama o novo endpoint para atualizar todos os parâmetros
      const res = await api.put(`/opportunities/${editingId}/parameters`, form);
      setOpportunities(opportunities.map(opp => opp.id === editingId ? res.data : opp));
      setEditingId(null);
    } else {
      const res = await api.post('/opportunities', form);
      setOpportunities([...opportunities, res.data]);
    }
    setForm({ title: '', value: '', stage: 'new', contact_id: '', description: '' });
    setShowModal(false);
  } catch (err) {
    console.error('Error saving opportunity:', err);
    setError('Error saving opportunity');
  }
};


  const handleEdit = (opp) => {
    setEditingId(opp.id);
    setForm({
      title: opp.title,
      value: opp.value,
      stage: opp.stage,
      contact_id: opp.contact_id,
      description: opp.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/opportunities/${id}`);
      setOpportunities(opportunities.filter(opp => opp.id !== id));
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError('Error deleting opportunity');
    }
  };

  // Nova função para finalizar a oportunidade
  const handleFinalize = async (id) => {
    try {
      await api.put(`/opportunities/${id}/finalize`);
      setOpportunities(opportunities.filter(opp => opp.id !== id));
    } catch (err) {
      console.error('Error finalizing opportunity:', err);
      setError('Error finalizing opportunity');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ title: '', value: '', stage: 'new', contact_id: '', description: '' });
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  // Função para agrupar oportunidades por estágio
  const groupByStage = (items) => {
    const grouped = {};
    pipelineStages.forEach(stage => {
      grouped[stage] = [];
    });
    items.forEach(item => {
      const stageLower = item.stage.toLowerCase();
      if (grouped[stageLower]) {
        grouped[stageLower].push(item);
      } else {
        grouped['new'].push(item);
      }
    });
    return grouped;
  };

  const groupedOpportunities = groupByStage(opportunities);

  // Função chamada ao finalizar o drag and drop
  const onDragEnd = async (result) => {
    if (!result.destination) return; // Se não houver destino, sai
    const { source, destination } = result;
    // Se não houver mudança de posição, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Se for movido dentro da mesma coluna, apenas reordena
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(groupedOpportunities[source.droppableId]);
      const [movedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, movedItem);
      const newGrouped = { ...groupedOpportunities, [source.droppableId]: items };
      const newOpportunities = [];
      pipelineStages.forEach(stage => {
        newOpportunities.push(...newGrouped[stage]);
      });
      setOpportunities(newOpportunities);
      return;
    }

    // Se for movido para uma coluna diferente
    const sourceList = Array.from(groupedOpportunities[source.droppableId]);
    const [movedItem] = sourceList.splice(source.index, 1);
    movedItem.stage = destination.droppableId.toLowerCase();
    const destList = Array.from(groupedOpportunities[destination.droppableId]);
    destList.splice(destination.index, 0, movedItem);
    const newGrouped = {
      ...groupedOpportunities,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    };
    const newOpportunities = [];
    pipelineStages.forEach(stage => {
      newOpportunities.push(...newGrouped[stage]);
    });
    setOpportunities(newOpportunities);
    try {
      await api.put(`/opportunities/${movedItem.id}`, { stage: movedItem.stage });
    } catch (err) {
      console.error('Error updating opportunity stage:', err);
      setError('Error updating opportunity stage');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container page-container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Opportunities</h2>
          <Button
            variant="primary"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', value: '', stage: 'new', contact_id: '', description: '' });
              handleShowModal();
            }}
          >
            Create Opportunity
          </Button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Modal para criação/edição */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Opportunity' : 'Create Opportunity'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter opportunity title"
              />
              <FormInput
                label="Value"
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="Enter opportunity value"
              />
              <FormInput
                label="Stage"
                type="text"
                name="stage"
                value={form.stage}
                onChange={handleChange}
                placeholder="Enter stage (e.g., new, negotiation, closed)"
              />
              <FormInput
                label="Contact ID"
                type="text"
                name="contact_id"
                value={form.contact_id}
                onChange={handleChange}
                placeholder="Enter associated contact ID"
              />
              <FormInput
                label="Description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter opportunity description"
              />
              <Button type="submit" variant="primary" className="mt-3">
                {editingId ? 'Update Opportunity' : 'Create Opportunity'}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Pipeline de Oportunidades com Drag and Drop */}
        {isClient && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="row">
              {pipelineStages.map(stage => (
                <div className="col-md-4 pipeline-column" key={stage}>
                  <div className="pipeline-column-header">
                    <h5>{stage.charAt(0).toUpperCase() + stage.slice(1)}</h5>
                  </div>
                  <Droppable droppableId={stage}>
                    {(provided) => (
                      <div
                        className="pipeline-column-body"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {groupedOpportunities[stage].length > 0 ? (
                          groupedOpportunities[stage].map((opp, index) => (
                            <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  className="pipeline-card"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <h6>{opp.title}</h6>
                                  <p><strong>Value:</strong> {opp.value}</p>
                                  <p><strong>Contact ID:</strong> {opp.contact_id}</p>
                                  <p><strong>Description:</strong> {opp.description}</p>
                                  <div className="mt-2">
                                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEdit(opp)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(opp.id)}>Delete</button>
                                    {opp.stage.toLowerCase() === 'closed' && (
                                      <button className="btn btn-sm btn-success ml-2" onClick={() => handleFinalize(opp.id)}>
                                        Finalize
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <p className="text-muted small">No opportunities</p>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;
