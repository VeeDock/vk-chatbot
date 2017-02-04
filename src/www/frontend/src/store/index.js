import Vue  from 'vue';
import Vuex from 'vuex';

import fetchSearch from './helpers/fetch-search';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      id:   0, 
      type: 0, 

      auth_key: ''
    }, 

    bots: [
      // Bot: {
      //   id:         Number
      //   name:       String
      //   avatar_url: String
      //   status:     String
      // }
    ]
  }, 

  actions: {
    FETCH_SEARCH_DATA ({ commit, state }) {
      let data = fetchSearch();

      if (!data) 
        return;

      commit('SET_USER', { user: data.user });
      commit('SET_BOTS', { bots: data.bots });
    }
  }, 

  mutations: {
    SET_USER (state, { user }) {
      state.user = user;
    }, 

    SET_BOTS (state, { bots }) {
      state.bots = bots;
    }
  }, 

  getters: {
    botNames (state) {
      return state.bots.reduce((ret, cur) => {
        ret[cur.id] = cur.name;

        return ret;
      }, {});
    }
  }
});