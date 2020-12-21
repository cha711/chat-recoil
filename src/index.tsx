import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import 'babel-polyfill';

import App from 'src/pages';

ReactDOM.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById('app')
);
