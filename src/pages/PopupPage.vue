<template>
  <div style="background: #f2f3f4">

    <div class="column q-gutter-y-sm pop-up-content text-white">
      <div class="column items-end ">
        <q-btn flat color="white" size="sm" text-color="green" icon="more_horiz">
          <q-menu>
            <q-list style="min-width: 100px" @click="checkAllRefresh">
              <q-item clickable v-close-popup>
                <q-item-section>tasks</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="clearRefresh">
                <q-item-section>clear</q-item-section>
                <q-item-section avatar side>
                  <q-icon name="power_settings_new" size="sm" color="green"/>
                </q-item-section>
              </q-item>

              <q-separator/>
            </q-list>
          </q-menu>


        </q-btn>

      </div>

      <div style="height: 20px;width: 100%"
           class="items-center column row justify-center"
           :class="{ 'bg-positive':tipInfo?.positive, 'bg-negative': tipInfo?.negative }">
        <div class="row items-center justify-center text-white q-pa-sm">
          <span v-if="tipInfo?.text"> {{ tipInfo?.text }}</span>
        </div>
      </div>


      <div class="column justify-center items-center q-pa-md">
        <img src="/icons/icon-128x128.png" style="width: 32px;height: 32px">
      </div>

      <div class="row q-mx-sm">
        <q-input
            style="width: 100%"
            dark
            name="website"
            v-model="website"
            color="primary"
            label="URL"
            filled
            clearable
            placeholder="https://www.youtube.com/"
        />
      </div>

      <div class="row q-mx-sm">
        <q-input
            style="width: 100%"
            dark
            name="time"
            v-model="time"
            color="primary"
            label="SECONDS"
            filled
            clearable
            placeholder="10s"
            type="number"
        />

      </div>

      <div class="column items-center q-py-md">
        <q-btn round color="white" text-color="green" icon="navigation" @click="addRefresh"/>
      </div>

    </div>
  </div>


</template>

<script lang="ts">
import {defineComponent, reactive, toRefs, watch} from 'vue'
import {useQuasar} from "quasar";

const REFRESH_KEY = 'REFRESH_KEY'

export default defineComponent({
  name: 'PopupPage',

  setup() {
    const $q = useQuasar();
    const data = reactive({
      website: '',
      time: null,
      textUrl: {} as any,
      tipInfo: {} as any,
      allRefreshTask: {} as any,
    })


    const addRefresh = () => {
      if (!data.website || !data.time) {
        return data.tipInfo = {text: 'url or time is null', negative: true}
      }

      $q.bex.send('storage.set', {
        payload: {key: REFRESH_KEY, data: {website: data.website, time: data.time}}
      }).then(r => {
        data.textUrl = JSON.stringify(r.data);
        return data.tipInfo = {text: 'add refresh task success', positive: true}
      })
    }


    const clearRefresh = () => {
      $q.bex.send('storage.clear', {payload: {key: REFRESH_KEY}}).then(r => {
        data.textUrl = JSON.stringify(r.data);
        return data.tipInfo = {text: 'clear all task success', positive: true}
      })
    }

    $q.bex.on('window-url-change', () => {
      $q.bex.send('addRefresh', {payload: {key: REFRESH_KEY}}).then(r => {
        data.textUrl = JSON.stringify(r.data);
        return data.tipInfo = {text: 'clear all task success', positive: true}
      })
    })


    const checkAllRefresh = () => {
      $q.bex.send('storage.get', {payload: {key: REFRESH_KEY}}).then(r => {
        return data.tipInfo = {text: r.data, positive: true}
      })

    }

    watch(() => data.tipInfo, () => {
      if (data.tipInfo.text) {
        setTimeout(() => {
          data.tipInfo = {};
        }, 5000)
      }
    })

    watch(() => data.textUrl, () => {
      if (data.textUrl) {
        setTimeout(() => {
          data.textUrl = {};
        }, 5000)
      }
    })

    return {addRefresh, clearRefresh, checkAllRefresh, ...toRefs(data)};
  }
})
</script>

<style>
.pop-up-content {
  width: 300px;
  border-radius: 15px;
  margin: 5px;
  background: linear-gradient(to right, #041828 0%, #033952 100%);
}
</style>
