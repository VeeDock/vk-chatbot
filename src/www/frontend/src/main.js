import Vue         from 'vue';
import VueResource from 'vue-resource';
import VueMaterial from 'vue-material';

Vue.use(VueResource);
Vue.use(VueMaterial);

import App    from './App';
import store  from './store';

Vue.material.registerTheme('default', {
  primary: 'blue-grey',
  accent: 'red',
  warn: 'red',
  background: 'white'
});

new Vue({
  store, 
  ...App
}).$mount('#mount-point');