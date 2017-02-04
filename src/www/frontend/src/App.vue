<template>
  <div id="app">
    <header class="header">
      <md-bottom-bar class="navbar">
        <md-bottom-bar-item @click.native="show('captcha')" md-icon="info" md-active>Ввести капчу</md-bottom-bar-item>
        <md-bottom-bar-item @click.native="show('bots')" md-icon="account_box">Список ботов</md-bottom-bar-item>
        <md-bottom-bar-item v-if="userType === 4" @click.native="show('manager')" md-icon="build">Управление</md-bottom-bar-item>
        <md-bottom-bar-item v-if="userType !== 4" md-icon="build" disabled>Управление</md-bottom-bar-item>
      </md-bottom-bar>
    </header>

    <main class="main">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component :is="view + '-view'"></component>
        </keep-alive>
      </transition>
    </main>
  </div>
</template>

<script>
import BotsView    from './views/BotsView';
import CaptchaView from './views/CaptchaView';
import ManagerView from './views/ManagerView';

export default {
  data () {
    return {
      view: 'captcha'
    }
  }, 

  components: {
    BotsView, CaptchaView, ManagerView
  }, 

  computed: {
    userType () {
      return this.$store.state.user.type;
    }
  }, 

  methods: {
    show (view) {
      this.view = view;
    }
  }, 

  created () {
    return this.$store.dispatch('FETCH_SEARCH_DATA');
  }
}
</script>

<style lang="stylus">
@require '../../../../node_modules/vue-material/dist/vue-material.css'

.fade-enter-active, 
.fade-leave-active
  transition all .2s ease

.fade-enter, 
.fade-leave-active
  opacity 0

.main
  max-width 504px
  margin 0 auto
  margin-top 10px

.navbar
  box-shadow none
  border-bottom 1px solid #ccc
</style>
