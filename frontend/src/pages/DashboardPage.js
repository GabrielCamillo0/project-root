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
import '../styles/Dashboardpage.css';
import { FaUser, FaMoneyBillWave, FaTasks, FaComments } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import SalesSummaryCards from '../components/SalesSummaryCards'; // Importa o componente SalesSummaryCards

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [users, setUsers] = useState([]);
  const [salesSummary, setSalesSummary] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  // Carrega dados principais do dashboard
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dashboardRes, contactsRes, opportunitiesRes, tasksRes, communicationsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/contacts'),
          api.get('/opportunities'),
          api.get('/tasks'),
          api.get('/communications'),
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

  // Carrega usuários (para exibição na seção de usuários)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };
    loadUsers();
  }, []);

  // Carrega sales summary para calcular faturamento e total de vendas
  useEffect(() => {
    const loadSalesSummary = async () => {
      try {
        const res = await api.get('/reports/sales-summary');
        setSalesSummary(res.data);
      } catch (err) {
        console.error('Error loading sales summary:', err);
      }
    };
    loadSalesSummary();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função que gera opções para os gráficos
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

  // Dados dos gráficos (mantidos para referência, mas não serão renderizados)
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
    labels: ['Total Opportunities'],
    datasets: [
      {
        label: 'Total Opportunities',
        data: dashboard ? [Number(dashboard.opportunitiesCount)] : [0],
        backgroundColor: 'rgba(153,102,255,0.6)',
      },
    ],
  };

  const tasksChartData = {
    labels: ['Total Tasks'],
    datasets: [
      {
        label: 'Total Tasks',
        data: dashboard ? [Number(dashboard.tasksCount)] : [0],
        backgroundColor: 'rgba(255,159,64,0.6)',
      },
    ],
  };

  const communicationsChartData = {
    labels: ['Total Communications'],
    datasets: [
      {
        label: 'Total Communications',
        data: dashboard ? [Number(dashboard.communicationsCount)] : [0],
        backgroundColor: 'rgba(255,99,132,0.6)',
      },
    ],
  };

  // Agregação dos dados de sales summary
  const totalRevenue = salesSummary.reduce((acc, row) => acc + parseFloat(row.total_value), 0);
  const totalSales = salesSummary.reduce((acc, row) => acc + parseInt(row.opportunities_count, 10), 0);
  const projectedRevenue = totalRevenue * 1.1; // Exemplo: 10% de crescimento

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
        {/* Cabeçalho com Seletor de Período */}
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
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : dashboard ? (
          <>
            {/* Componente SalesSummaryCards */}
            <SalesSummaryCards
              totalRevenue={totalRevenue}
              totalSales={totalSales}
              projectedRevenue={projectedRevenue}
              formatCurrency={formatCurrency}
            />

            {/* Cartões de Resumo */}
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

            {/* Seção de Usuários */}
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
                              <th>Faturamento</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((u) => {
                              const userSales = salesSummary.filter(s => Number(s.user_id) === Number(u.id));
                              const totalSales = userSales.reduce((acc, cur) => acc + parseFloat(cur.total_value), 0);
                              return (
                                <tr key={u.id}>
                                  <td>{u.id}</td>
                                  <td>{u.username}</td>
                                  <td>{u.role}</td>
                                  <td>{formatCurrency(totalSales)}</td>
                                </tr>
                              );
                            })}
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
