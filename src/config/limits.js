'use strict';

module.exports = {
  message: {
    count: 5, 
    time:  60, 
    type:  'local'
  }, 

  // 30K images/month allowed
  'command:emo': {
    count: 967, 
    time:  24 * 60 * 60, 
    type:  'global'
  }, 

  'command:g': {
    count: 50, 
    time:  24 * 60 * 60, 
    type:  'local'
  }, 

  // 50K units/month allowed
  'command:tts': {
    count: 1600, 
    time:  24 * 60 * 60, 
    type:  'global'
  }, 

  'command:unsplash': {
    count: 5, 
    time:  24 * 60 * 60, 
    type:  'local'
  }, 

  // 60 req/minute allowed
  'command:weather': {
    count: 60, 
    time:  60, 
    type:  'global'
  }
}