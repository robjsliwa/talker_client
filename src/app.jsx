import { render } from 'react-dom';
import React from 'react';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import App from './index';
import RegisterScreen from './components/register-screen';

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

//<Route path="/" component={Hangout} onEnter={Hangout.onEnter}/>

render(<Router history={appHistory}>
  <Route handler={App}>
    <IndexRoute component={RegisterScreen} />
    <Route path="/" component={RegisterScreen} />
  </Route>
</Router>, document.querySelector('#target'));
