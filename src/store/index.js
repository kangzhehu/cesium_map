import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state:{
        footerProperties: {}, //底部地理信息属性
    },
    getters:{
        getFooterProperties:(state) => {
            return state.footerProperties
        },
    },
    mutations:{
        setFooterProperties:(state, payload) => {
            state.footerProperties = payload
        },
    },
    actions:{
        setFooterPropertiesAsync({commit},payload){
            commit('setFooterProperties', payload)
        },
    }
})