<template>
  <md-list>
    <md-list-item v-for="bot of bots" :href="'https://vk.com/id' + bot.id" target="_blank">
      <md-avatar>
        <img :src="bot.avatar_url" :alt="bot.name"/>
      </md-avatar>

      <div class="md-list-text-container">
        <span>{{ bot.name }}</span>
        <span>{{ bot.status }}</span>
      </div>

      <md-button class="md-icon-button md-list-action">
        <md-icon class="md-primary">chat_bubble</md-icon>
      </md-button>
    </md-list-item>
  </md-list>
</template>

<script>
export default {
  computed: {
    bots () {
      return this.$store.state.bots;
    }
  }
}
</script>

<style lang="stylus" scoped>
.md-list
  padding-top 0
  max-height 330px
  overflow-y scroll
</style>