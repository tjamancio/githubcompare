import React, { Component } from 'react';

import moment from 'moment';
import api from '../../services/api';
import logo from '../../assets/logo.png';
import { Container, Form } from './styles';

import CompareList from '../../components/CompareList';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryInput: '',
    repositories: [],
    repositoryError: false,
  };

  componentDidMount() {
    const repositories = JSON.parse(localStorage.getItem('repositories'));
    if (repositories) {
      this.setState({
        repositories,
      });
    }
  }

  handleAddRepository = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });
    try {
      const { data: repository } = await api.get(`/repos/${this.state.repositoryInput}`);
      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState(
        {
          repositoryInput: '',
          repositoryError: false,
          repositories: [...this.state.repositories, repository],
        },
        () => localStorage.setItem('repositories', JSON.stringify(this.state.repositories)),
      );
    } catch (err) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDeleteClick = (id) => {
    this.setState(
      {
        repositories: this.state.repositories.filter(repository => repository.id !== id),
      },
      () => localStorage.setItem('repositories', JSON.stringify(this.state.repositories)),
    );
  };

  handleRefreshClick = async (id) => {
    const { repositories } = this.state;
    const repository = repositories.find(repo => repo.id === id);

    try {
      const { data } = await api.get(`/repos/${repository.full_name}`);
      data.lastCommit = moment(repository.pushed_at).fromNow();
      this.setState(
        {
          repositories: repositories.map(repo => (repo.id === data.id ? data : repo)),
        },
        () => localStorage.setItem('repositories', JSON.stringify(this.state.repositories)),
      );
    } catch (err) {}
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Github Compare" />
        <Form withError={this.state.repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {this.state.loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}
          </button>
        </Form>

        <CompareList
          onRefreshClick={this.handleRefreshClick}
          onDeleteClick={this.handleDeleteClick}
          repositories={this.state.repositories}
        />
      </Container>
    );
  }
}
