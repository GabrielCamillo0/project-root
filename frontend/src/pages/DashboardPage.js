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
import '../styles/Dashboardpage.css'; // Certifique-se de criar esse arquivo

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  // Dados agregados para os gráficos
  const [dashboard, setDashboard] = useState(null);
  // Dados detalhados para cada módulo
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setDashboard(res.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error loading dashboard data');
      }
    };

    const fetchContacts = async () => {
      try {
        const res = await api.get('/contacts');
        setContacts(res.data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };

    const fetchOpportunities = async () => {
      try {
        const res = await api.get('/opportunities');
        setOpportunities(res.data);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    const fetchCommunications = async () => {
      try {
        const res = await api.get('/communications');
        setCommunications(res.data);
      } catch (err) {
        console.error('Error fetching communications:', err);
      }
    };

    fetchDashboard();
    fetchContacts();
    fetchOpportunities();
    fetchTasks();
    fetchCommunications();
  }, []);

  // Dados dos gráficos
  const contactsChartData = {
    labels: ['Contacts'],
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
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  // Função para renderizar uma tabela simples com fonte reduzida
  const renderTable = (data, columns) => {
    return (
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
                  <td key={col.field}>{row[col.field]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="container dashboard-container">
        <h2 className="mb-4">Dashboard</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {dashboard ? (
          <div className="row">
            {/* Card Contacts */}
            <div className="col-12 col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-header dashboard-card-header bg-primary text-white">
                  Contacts
                </div>
                <div className="card-body dashboard-card-body">
                  {renderTable(contacts, [
                    { field: 'name', header: 'Name' },
                    { field: 'email', header: 'Email' },
                    { field: 'phone', header: 'Phone' },
                    { field: 'status', header: 'Status' },
                  ])}
                </div>
                <div className="card-footer dashboard-card-footer">
                  <div className="chart-container">
                    <Bar
                      data={contactsChartData}
                      options={{ ...chartOptions, title: { display: true, text: 'Contacts' } }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Card Opportunities */}
            <div className="col-12 col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-header dashboard-card-header bg-success text-white">
                  Opportunities
                </div>
                <div className="card-body dashboard-card-body">
                  {renderTable(opportunities, [
                    { field: 'title', header: 'Title' },
                    { field: 'value', header: 'Value' },
                    { field: 'stage', header: 'Stage' },
                    { field: 'contact_id', header: 'Contact ID' },
                  ])}
                </div>
                <div className="card-footer dashboard-card-footer">
                  <div className="chart-container">
                    <Bar
                      data={opportunitiesChartData}
                      options={{ ...chartOptions, title: { display: true, text: 'Opportunities' } }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Card Tasks */}
            <div className="col-12 col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-header dashboard-card-header bg-warning text-dark">
                  Tasks
                </div>
                <div className="card-body dashboard-card-body">
                  {renderTable(tasks, [
                    { field: 'title', header: 'Title' },
                    { field: 'description', header: 'Description' },
                    { field: 'due_date', header: 'Due Date' },
                    { field: 'status', header: 'Status' },
                  ])}
                </div>
                <div className="card-footer dashboard-card-footer">
                  <div className="chart-container">
                    <Bar
                      data={tasksChartData}
                      options={{ ...chartOptions, title: { display: true, text: 'Tasks' } }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Card Communications */}
            <div className="col-12 col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-header dashboard-card-header bg-danger text-white">
                  Communications
                </div>
                <div className="card-body dashboard-card-body">
                  {renderTable(communications, [
                    { field: 'type', header: 'Type' },
                    { field: 'content', header: 'Content' },
                    { field: 'contact_id', header: 'Contact ID' },
                    { field: 'created_at', header: 'Created At' },
                  ])}
                </div>
                <div className="card-footer dashboard-card-footer">
                  <div className="chart-container">
                    <Bar
                      data={communicationsChartData}
                      options={{ ...chartOptions, title: { display: true, text: 'Communications' } }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading dashboard data...</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
