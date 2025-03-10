import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import AccountsPage from './pages/AccountsPage';
import TasksPage from './pages/TasksPage';
import CommunicationsPage from './pages/CommunicationsPage';
import PrivateRoute from './components/PrivateRoute';

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/login" component={LoginPage} />
      <PrivateRoute exact path="/" component={DashboardPage} />
      <PrivateRoute path="/dashboard" component={DashboardPage} />
      <PrivateRoute path="/contacts" component={ContactsPage} />
      <PrivateRoute path="/opportunities" component={OpportunitiesPage} />
      <PrivateRoute path="/accounts" component={AccountsPage} />
      <PrivateRoute path="/tasks" component={TasksPage} />
      <PrivateRoute path="/communications" component={CommunicationsPage} />
      <Route path="*">
        <h2 className="text-center mt-5">404 - Page Not Found</h2>
      </Route>
    </Switch>
  </Router>
);

export default App;
