<template>
  <md-card>
    <md-card-header>
      <div :class="['md-title', { active: isActive }]">{{ title }}</div>
      <div class="md-subhead">{{ desc }}</div>
    </md-card-header>

    <md-card-content>
      <template v-if="captchaUrl">
        <md-image :md-src="captchaUrl"></md-image>
        <input @keyup.enter="sendCaptcha" v-model="captchaKey" placeholder="Код" class="captcha_input" />
        <md-button @click="sendCaptcha" class="md-raised">Отправить</md-button>
      </template>
    </md-card-content>
  </md-card>
</template>

<script>
export default {
  data () {
    return {
      title: 'Сейчас нет активных капч', 
      desc:  'Подождите немного или вернитесь сюда позже', 
      captchaUrl: null, 
      captchaKey: '', 
      captchas: []
    }
  }, 

  computed: {
    isActive () {
      return this.captchas.length > 0;
    }
  }, 

  methods: {
    sendCaptcha () {
      if (!this.captchaKey || /[^a-zа-яё0-9]/i.test(this.captchaKey)) 
        return;

      this.$http.post('/captcha', {
        auth_key: this.$store.state.user.auth_key, 
        user_id:  this.$store.state.user.id, 
        captcha:  Object.assign({}, this.captchas[0], { key: this.captchaKey })
      }).then(data => {
          this.removeCaptcha(this.captchas[0]);
          this.captchaKey = '';
      });
    }, 

    addCaptcha (data) {
      this.captchas.push(data);
    }, 

    removeCaptcha (data) {
      for (let [index, value] of this.captchas.entries()) 
        if (value.sid === data.sid && value.id === data.id) 
          this.captchas.splice(index, 1);
    }
  }, 

  created () {
    let self = this;

    (function getCaptcha () {
      self.$http.get('/captcha')
        .then(response => {
          self.captchas = response.body.response;

          return setTimeout(() => getCaptcha(), 2000);
        });
    })();
  }, 

  destroyed () {
    if (window.__es) {
      window.__es.close();
    }
  }, 

  watch: {
    captchas: function (value) {
      if (value.length > 0) {
        let captcha = value[0];

        // @todo:
        // VK.callMethod('setTitle', '*** Капча ***');

        this.title      = 'Есть активная капча';
        this.desc       = 'Ввод капчи разморозит бота ' + this.$store.getters.botNames[captcha.id];
        this.captchaUrl = '/captcha/binary?sid=' + captcha.sid;
      } else {
        this.title      = 'Сейчас нет активных капч';
        this.desc       = 'Подождите немного или вернитесь сюда позже';
        this.captchaUrl = null;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.md-button
  float right
  margin-top 15px

.active
  color green

.md-image
  display inline-block
  width 208px
  height 80px

.captcha_input
  display inline-block
  box-sizing border-box
  vertical-align middle
  border none
  background none
  line-height 80px
  height 80px
  width 208px
  outline none
  padding 0 10px
  font-size 30px
  font-family inherit
  
  @media (max-width 500px)
    &
      display block
</style>
