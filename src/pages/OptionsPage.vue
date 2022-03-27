<template>
  <q-layout view="lHh Lpr lFf">
    <q-btn label="refresh" @click="onRefresh"></q-btn>
    <q-btn label="sendMsg" @click="onSendMsg"></q-btn>
    <q-btn label="message.to.quasar" @click="onSendMsgToQuasar"></q-btn>
  </q-layout>
</template>

<script lang="ts">
import {defineComponent, onBeforeUnmount} from 'vue'
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";


export default defineComponent({
  name: 'OptionsPage',


  setup() {
    return {};
  }
})
</script>
