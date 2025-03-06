import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { restoreLoadingState } from './store/loadingSlice';
import './index.css';
import App from './App';

// Khôi phục loading state trước khi render
store.dispatch(restoreLoadingState());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);