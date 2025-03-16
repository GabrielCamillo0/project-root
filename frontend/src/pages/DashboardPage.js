// frontend/src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/Dashboardpage.css'; // Certifique-se de criar e ajustar esse arquivo
import { FaUser, FaMoneyBillWave, FaTasks, FaComments, FaEllipsisV } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const { user } = useAuth(); // Obtém o usuário logado
  const [dashboard, setDashboard] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [users, setUsers] = useState([]); // Estado para armazenar os usuários
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carrega dados em paralelo
        const [dashboardRes, contactsRes, opportunitiesRes, tasksRes, communicationsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/contacts'),
          api.get('/opportunities'),
          api.get('/tasks'),
          api.get('/communications')
        ]);
        setDashboard(dashboardRes.data);
        setContacts(contactsRes.data);
        setOpportunities(opportunitiesRes.data);
        setTasks(tasksRes.data);
        setCommunications(communicationsRes.data);
        setError('');
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeframe]);

  // Carrega os usuários (agora para todos os usuários, sem restrição)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/auth/users'); // Endpoint que retorna os usuários
        setUsers(res.data);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };
    loadUsers();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
    },
    scales: { y: { beginAtZero: true } },
    animation: { duration: 2000, easing: 'easeOutQuart' },
  });

  // Dados dos gráficos
  const contactsChartData = {
    labels: ['Total Contacts'],
    datasets: [
      {
        label: 'Total Contacts',
        data: dashboard ? [Number(dashboard.contactsCount)] : [0],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const opportunitiesChartData = {
    labels: ['Opportunities'],
    datasets: [
      {
        label: 'Total Opportunities',
        data: dashboard ? [Number(dashboard.opportunitiesCount)] : [0],
        backgroundColor: 'rgba(153,102,255,0.6)',
      },
    ],
  };

  const tasksChartData = {
    labels: ['Tasks'],
    datasets: [
      {
        label: 'Total Tasks',
        data: dashboard ? [Number(dashboard.tasksCount)] : [0],
        backgroundColor: 'rgba(255,159,64,0.6)',
      },
    ],
  };

  const communicationsChartData = {
    labels: ['Communications'],
    datasets: [
      {
        label: 'Total Communications',
        data: dashboard ? [Number(dashboard.communicationsCount)] : [0],
        backgroundColor: 'rgba(255,99,132,0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: false } },
  };

  // Função para renderizar uma tabela simples
  const renderTable = (data, columns, emptyMessage = "No records found.") => (
    <table className="table table-sm table-striped dashboard-table">
      <thead className="thead-light">
        <tr>
          {columns.map((col) => (
            <th key={col.field}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.field}>
                  {col.field === 'creator_name'
                    ? row.creator_name || row.user_id
                    : row[col.field]}
                </td>
              ))}
              <td className="text-end">{/* Ações podem ser inseridas aqui */}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1} className="text-center">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderTimeframeSelector = () => (
    <div className="btn-group btn-group-sm" role="group" aria-label="Timeframe selector">
      <button type="button" className={`btn ${timeframe === 'week' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeframe('week')}>
        Esta Semana
      </button>
      <button type="button" className={`btn ${timeframe === 'month' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeframe('month')}>
        Este Mês
      </button>
      <button type="button" className={`btn ${timeframe === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeframe('quarter')}>
        Este Trimestre
      </button>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container dashboard-container">
        <div className="dashboard-header row">
          <div className="col-12 col-md-6">
            <h2>Painel de Controle</h2>
            <p className="dashboard-subtitle">Visão geral da atividade do CRM</p>
          </div>
          <div className="col-12 col-md-6 d-flex justify-content-md-end align-items-center">
            {renderTimeframeSelector()}
          </div>
        </div>
        {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}
        {dashboard ? (
          <>
            {/* Resumo de Estatísticas */}
            <div className="row mb-4">
              <div className="col-12 col-md-3 mb-3 mb-md-0">
                <div className="card dashboard-card contacts-card">
                  <div className="card-header dashboard-card-header bg-primary text-white">
                    Contacts
                  </div>
                  <div className="card-body dashboard-card-body">
                    <div className="dashboard-stats">
                      <div className="stat-value">{dashboard.contactsCount || 0}</div>
                      <div className="stat-label">total</div>
                    </div>
                    <div className="text-success small">
                      <strong>+12%</strong> em relação ao mês anterior
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-3 mb-3 mb-md-0">
                <div className="card dashboard-card opportunities-card">
                  <div className="card-header dashboard-card-header bg-success text-white">
                    Opportunities
                  </div>
                  <div className="card-body dashboard-card-body">
                    <div className="dashboard-stats">
                      <div className="stat-value">{dashboard.opportunitiesCount || 0}</div>
                      <div className="stat-label">total</div>
                    </div>
                    <div className="text-success small">
                      <strong>{formatCurrency(dashboard.opportunitiesTotal || 0)}</strong> em potencial
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-3 mb-3 mb-md-0">
                <div className="card dashboard-card tasks-card">
                  <div className="card-header dashboard-card-header bg-warning text-dark">
                    Tasks
                  </div>
                  <div className="card-body dashboard-card-body">
                    <div className="dashboard-stats">
                      <div className="stat-value">{dashboard.tasksCount || 0}</div>
                      <div className="stat-label">total</div>
                    </div>
                    <div className="text-warning small">
                      <strong>{dashboard.pendingTasksCount || 0}</strong> pendentes
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="card dashboard-card communications-card">
                  <div className="card-header dashboard-card-header bg-danger text-white">
                    Communications
                  </div>
                  <div className="card-body dashboard-card-body">
                    <div className="dashboard-stats">
                      <div className="stat-value">{dashboard.communicationsCount || 0}</div>
                      <div className="stat-label">total</div>
                    </div>
                    <div className="text-success small">
                      <strong>+8%</strong> em relação à semana anterior
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Informações Detalhadas */}
            <div className="row">
              <div className="col-12 col-md-6 mb-4">
                <div className="card dashboard-card">
                  <div className="dashboard-card-header contacts-card" style={{ backgroundColor: 'var(--card-color)', color: 'white' }}>
                    <div>Contatos</div>
                    <button className="btn btn-sm text-white">Ver Todos</button>
                  </div>
                  <div className="dashboard-card-body">
                    {renderTable(contacts, [
                      { field: 'id', header: 'ID' },
                      { field: 'name', header: 'Name' },
                      { field: 'email', header: 'Email' },
                      { field: 'phone', header: 'Phone' },
                      { field: 'status', header: 'Status' },
                      { field: 'lead_score', header: 'Score' },
                      { field: 'creator_name', header: 'Created By' },
                    ], "No contacts found.")}
                  </div>
                  <div className="dashboard-card-footer">
                    <div className="chart-container">
                      <Bar
                        data={contactsChartData}
                        options={{ ...chartOptions, title: { display: true, text: 'Contacts' } }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 mb-4">
                <div className="card dashboard-card">
                  <div className="dashboard-card-header opportunities-card" style={{ backgroundColor: 'var(--card-color)', color: 'white' }}>
                    <div>Oportunidades</div>
                    <button className="btn btn-sm text-white">Ver Todos</button>
                  </div>
                  <div className="dashboard-card-body">
                    {renderTable(opportunities, [
                      { field: 'title', header: 'Título' },
                      { field: 'value', header: 'Valor' },
                      { field: 'stage', header: 'Estágio' },
                      { field: 'contact_id', header: 'ID Contato' },
                    ])}
                  </div>
                  <div className="dashboard-card-footer">
                    <div className="chart-container">
                      <Bar
                        data={opportunitiesChartData}
                        options={{ ...chartOptions, title: { display: true, text: 'Oportunidades' } }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 mb-4">
                <div className="card dashboard-card">
                  <div className="dashboard-card-header tasks-card" style={{ backgroundColor: 'var(--card-color)', color: 'white' }}>
                    <div>Tarefas</div>
                    <button className="btn btn-sm text-white">Ver Todos</button>
                  </div>
                  <div className="dashboard-card-body">
                    {renderTable(tasks, [
                      { field: 'title', header: 'Título' },
                      { field: 'description', header: 'Descrição' },
                      { field: 'due_date', header: 'Data Limite' },
                      { field: 'status', header: 'Status' },
                    ])}
                  </div>
                  <div className="dashboard-card-footer">
                    <div className="chart-container">
                      <Bar
                        data={tasksChartData}
                        options={{ ...chartOptions, title: { display: true, text: 'Tarefas' } }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 mb-4">
                <div className="card dashboard-card">
                  <div className="dashboard-card-header communications-card" style={{ backgroundColor: 'var(--card-color)', color: 'white' }}>
                    <div>Comunicações</div>
                    <button className="btn btn-sm text-white">Ver Todos</button>
                  </div>
                  <div className="dashboard-card-body">
                    {renderTable(communications, [
                      { field: 'type', header: 'Type' },
                      { field: 'content', header: 'Content' },
                      { field: 'contact_id', header: 'ID Contato' },
                      { field: 'created_at', header: 'Created At' },
                    ])}
                  </div>
                  <div className="dashboard-card-footer">
                    <div className="chart-container">
                      <Bar
                        data={communicationsChartData}
                        options={{ ...chartOptions, title: { display: true, text: 'Comunicações' } }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Seção de Usuários: Exibida para todos (para teste) */}
            <div className="row">
              <div className="col-12">
                <div className="card dashboard-card">
                  <div className="dashboard-card-header bg-dark text-white">
                    Usuários
                  </div>
                  <div className="dashboard-card-body">
                    {users.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm dashboard-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Username</th>
                              <th>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((u) => (
                              <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.role}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>Nenhum usuário encontrado.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Loading dashboard data...</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
