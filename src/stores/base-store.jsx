import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/app-dispatcher.jsx';

export default class BaseStore extends EventEmitter {
  constructor() {
    super();
  }

  emitChange() {
    this.emit('STORE_CHANGE');
  }

  addChangeListener(callback) {
    this.on('STORE_CHANGE', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('STORE_CHANGE', callback);
  }

  registerActions(actionsRegistered) {
    this._dispatchToken = AppDispatcher.register(actionsRegistered());
  }

  get dispatchToken() {
    return this._dispatchToken;
  }
}
