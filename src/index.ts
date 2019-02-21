import './index.scss';
import { App } from './app/app';

let container = document.querySelector('#app');
if(container) new App(container);