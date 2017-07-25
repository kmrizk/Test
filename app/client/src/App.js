import React, { Component } from 'react';
import { fetchShards, fetchMessages } from './api';
import { login, getToken } from './auth';
import Output from './Output';
import Prompt from './Prompt';
import './css/App.css';

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      entries: [],
      history: [],
      commands: {},
      lastHistoryIndex: -1,
      input: ''
    };
    this.entryTypes = {
      COMMAND: 'COMMAND',
      OUTPUT: 'OUTPUT'
    }
    this.handleKeys = this.handleKeys.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  componentDidMount() {
    this.textInput.focus();
    this.registerCommands();

    //track input focus
    const view = document.getElementById('main');
    view.addEventListener('click', () => {
      if (!window.getSelection().toString()) {
        this.textInput.focus();
      }
    });

    const token = getToken();
    if (token) {
      const tokenParts = token.split('.');
      const encodedPayload = tokenParts[1];
      if (encodedPayload) {
        const payload = JSON.parse(window.atob(encodedPayload));
        this.addOutput('You are now authenticated!');
        this.addOutput(JSON.stringify(payload, null, 1), 'json');
      } else {
        this.addOutput('Could not parse authentification token');
      }
    }
  }

  componentDidUpdate() {
    //keep scrolling to the bottom
    const view = document.getElementById('main');
    view.scrollTop = view.scrollHeight - view.style.height;
  }

  registerCommands() {
    this.setState({
      commands: [
        {
          name: 'describe',
          description: 'describe <messageType> - lists the shards of the message type. ' +
          'The <messageType> is the name of the file from the data folder.',
          fn: this.getShards
        },
        {
          name: 'messages',
          description: 'messages <messageType> <shardId> [amount] - lists the messages from the shard.' +
          'The default amount is 3 messages.',
          fn: this.getMessages
        },
        {
          name: 'login',
          description: 'login - authenticates the current user.',
          fn: () => {
            login();
            return Promise.resolve({output: ''});
          }
        },
        {
          name: 'help',
          description: 'help - prints this help.',
          fn: () => {
            const output = this.state.commands.map(c => `${c.description}\n`);
            return Promise.resolve({output, format: 'pre'});
          }
        },
        {
          name: 'clear',
          description: 'clear - clears the terminal.',
          fn: () => {
            const entries = this.state.entries.map(e => ({...e, cleared: true}));
            this.setState((prevState, props) => ({entries}));
            return Promise.resolve({output: ''});
          }
        }
      ]
    });
  }

  getShards([messageType]) {
    if (!messageType || (typeof messageType === 'string' && !messageType.trim())) {
      return Promise.reject('You must specify <messageType>');
    }
    return fetchShards(messageType)
      .then(shards => ({
        output: JSON.stringify(shards, null, 1),
        format: 'json'
      }));
  }

  getMessages([messageType, shardId, amount = 3]) {
    if (!messageType || (typeof messageType === 'string' && !messageType.trim())) {
      return Promise.reject('You must specify <messageType>');
    } else if (!shardId || (typeof shardId === 'string' && !shardId.trim())) {
      return Promise.reject('You must specify <shardId>');
    }

    return fetchMessages(messageType, shardId, amount)
      .then(messages => ({
        output: JSON.stringify(messages, null, 1),
        format: 'json'
      }));
  }

  addEntry(val, type, format) {
    this.setState((prevState, props) => ({
      entries: [...prevState.entries, {val, type, format}]
    }));
  }

  addCommand(input) {
    this.addEntry(input, this.entryTypes.COMMAND, 'command');
    const entry = input.replace(/\s+/g,' ').trim();
    const index = this.state.history.indexOf(entry);
    if (index === -1 && entry !== '') {
      this.setState((prevState, props) => (
        {
          history: [...prevState.history, entry],
          lastHistoryIndex: -1
        }
      ));
    }
  }

  addOutput(output, format) {
    this.addEntry(output, this.entryTypes.OUTPUT, format);
  }

  clearInput() {
    this.textInput.value = '';
  }

  executeCmd(cmd, args) {
    if (!cmd || (typeof cmd === 'string' && cmd.trim() === '')) {
      return Promise.resolve('');
    }

    const command = this.state.commands.find(c => c.name === cmd);
    if (!command) {
      const output = `${cmd}: Command not found. Type help to see all commands.`;
      return Promise.resolve({output});
    }

    return command.fn(args);
  }

  processCmd(input) {
    const [cmd, ...args] = input.split(' ').map(s => s.trim()).filter(s =>!!s);
    this.addCommand(input);
    this.executeCmd(cmd, args)
      .then(({output, format}) => {
        this.addOutput(output, format);
      })
      .catch(err => {
        if (err.response.status === 403) {
          this.addOutput('You are not logged in. Please run "login".');
        } else {
          this.addOutput('' + err);
        }
      })
      .then(() => this.clearInput());
  }

  handleInput(e) {
    const input = e.target.value;
    this.setState((prevState, props) => ({input}));
  }

  handleArrowUp(event) {
    event.preventDefault();
    let {lastHistoryIndex, history} = this.state;
    if (history.length) {
      let index;
      if (lastHistoryIndex > 0) {
        index = lastHistoryIndex - 1;
      } else {
        index = history.length - 1;
      }
      this.setState((prevState, props) => ({input: history[index], lastHistoryIndex: index}));
    }
  }

  handleArrowDown(event) {
    event.preventDefault();
    let {lastHistoryIndex, history} = this.state;
    if (history.length && lastHistoryIndex < history.length - 1) {
      const index  = lastHistoryIndex + 1;
      this.setState((prevState, props) => ({input: history[index], lastHistoryIndex: index}));
    }
  }

  handleKeys(e) {
    switch (e.key) {
      case 'Enter':
        const input = e.target.value;
        this.processCmd(input);
        break;
      case 'ArrowUp':
        this.handleArrowUp(e);
        break;
      case 'ArrowDown':
        this.handleArrowDown(e);
        break;
      default:
        return e;
    }
  }

  render() {
    const output = this.state.entries
      .filter(entry => !entry.cleared)
      .map((entry, index) => (
        <Output
          key={index}
          {...entry}
          isCommand={entry.type === this.entryTypes.COMMAND}
        />
      ));

    return (
      <div className='terminal' onClick={this.handleClick}>
        {output}
        <p>
          <Prompt />
          <input
            type="text"
            value={this.state.input}
            onKeyDown={this.handleKeys}
            onChange={this.handleInput}
            ref={(input) => { this.textInput = input; }}
            autoComplete="off"
            spellCheck="false"
          />
        </p>
      </div>
    );
  }
}

export default App;
