Vue.config.ignoredElements = ['ion-icon'];

const store = new Vuex.Store({
  state: {
    resources: []
  },
  getters: {
    resources: (state) => {
      return state.resources;
    },
    typeResources: (state) => (type) => {
      if (type === 'More') {
        return state.resources.filter(
          resource => resource.Location_Type !== 'Accomodation' &&
                      resource.Location_Type !== 'Attraction' &&
                      resource.Location_Type !== 'Services');
      }
      return state.resources.filter(resource => resource.Location_Type === type);
    }
  },
  mutations: {
    updateResources: (state, resources) => {
      state.resources = resources;
    }
  }
});

const Header = Vue.component('app-header', {
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-transparent fixed-top">
    <div class="input-group shadow-sm text-small">
      <input type="text" v-model="searchTerm"
        class="form-control text-small" placeholder="Search Treasure Beach...">
      <div class="input-group-append">
        <button @click="searchResources" class="btn btn-primary text-center d-flex justify-content-center align-items-center" type="button">
          <ion-icon name="search"></ion-icon>
        </button>
        <button @click="getDirections" class="btn btn-info text-center d-flex justify-content-center align-items-center" type="button">
          <ion-icon name="compass"></ion-icon>
        </button>
      </div>
    </div>
  </nav>
  `,
  data: function() {
    return {
      searchTerm: ''
    }
  },
  methods: {
    searchResources: function() {
      console.log(this.searchTerm);
    },
    getDirections: function() {
      console.log(this.searchTerm);
    }
  }
});

Vue.component('resource-card', {
  template: `
  <div class="card shadow-sm mr-2 bg-transparent text-dark">
    <router-link to="/">
      <img class="card-img img-fluid" 
          :src="'http://api.opencaribbean.org/api/v1/media/download/' + resource.mainImage">
    </router-link>
    <small class="mt-1 font-weight-bold">{{ resource.name }}</small>
  </div>
  `,
  props: ['resource'],
  created: function() {
    console.log('created');
  }
});

Vue.component('resource-listing', {
  template: `
  <section>
    <h1 class="font-weight-bold section-title">{{ type }}</h1>
    <div class="scrolling-wrapper">
      <resource-card v-for="resource in resources" 
        :resource="resource" :key="resource.id"></resource-card>
    </div>
  </section>
  `,
  props: ['type', 'resources'],
  updated: function() {
    console.log(this.resources);
  }
});

const Footer = Vue.component('app-footer', {
  template: `
  <footer id="navCentre"
    class="fixed-bottom bg-white rounded-top-xtra 
          shadow-sm nav-centre d-flex flex-column 
          align-items-center">
    <div @click="extendNavCentre" class="clickable notch mt-2"></div>
    <div class="container pt-3 pl-3 pr-3 d-flex flex-row justify-content-between align-items-center overflow-x-scroll">
        <category-icon title="Stays" type="Accomodation" icon="business"></category-icon>
        <category-icon title="Attractions" type="Attraction" icon="paper"></category-icon>
        <category-icon title="Services" type="Services" icon="build"></category-icon>
        <category-icon title="More" type="More" icon="code-working"></category-icon>
    </div>
  </footer>
  `,
  data: function() {
    return {
      isExtended: false,
    }
  },
  methods: {
    extendNavCentre: function() {
      this.isExtended = !this.isExtended;
    }
  }
});

const CategoryIcon = Vue.component('category-icon', {
  template: `
    <div @click="filterResources" class="clickable d-flex flex-column justify-content-center align-items-center">
      <div style="background-color: #007bff;"
        class="shadow-sm rounded-circle type-icon d-flex justify-content-center align-items-center text-white">
        <ion-icon :name="icon"></ion-icon>
      </div>
      <small class="text-muted">{{ title }}</small>
    </div>
  `,
  props: ['title', 'type', 'icon'],
  methods: {
    filterResources: function() {
      const results = this.$store.getters.typeResources(this.type);
      this.$emit('filter-resources', results);
      console.log(results);
    }
  }
});

const Explore = Vue.component('explore', {
    template: `
    <div>
        <div id="map" v-on:filter-resources="updateMarkers"></div>
    </div>
    `,
    data: function() {
      return {
        accessToken: 'pk.eyJ1IjoiemRtd2kiLCJhIjoiY2l6a3EyOW1wMDAzbjJ3cHB2aHQ5a2N1eCJ9.xOIXUuzA4pJt7cLIR-wUSg',
        lat: 17.8871132,
        lng: -77.7639855,
        zoom: 14,
        map: null,
      }
    },
    methods: {
      updateResources : function(resources) {
        this.$store.commit('updateResources', resources);
      },

      updateMarkers: function(resources) {
        let self = this;

        self.map._layers.forEach(layer => {

        })
      }
    },
    mounted: function() {
      let self = this;

      self.map = L.map('map', {
        zoomControl: false
      }).setView([this.lat, this.lng], this.zoom);
  
      L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token='+ this.accessToken, {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox.streets',
          accessToken: this.accessToken
      }).addTo(self.map);

      fetch('/api/resources', {
        method: 'GET'
      })
      .then(res => {
        return res.json()
      })
      .then(data => {
        self.updateResources(data);

        console.log(data);

        self.$store.getters.resources.forEach(resource => {
          L.marker([resource._Location_latitude, resource._Location_longitude])
          .bindPopup(`
          <div style="width: 150px;">
            <!-- <img src="api.opencaribbean.org/api/v1/media/download/${resource.Images}" class="card-img-top" alt="..."> -->
            <div class="card-body p-0">
              <h5 class="card-title">${resource.Name}</h5>
              <p class="card-text">${resource.Description}</p>
            </div>
          </div>
          `)
          .openPopup()
          .addTo(self.map);
        })
      });
    }
});

const NotFound = Vue.component('not-found', {
  template: `
  <div>
      <h1>404 - Not Found</h1>
  </div>
  `
});

const router = new VueRouter({
  mode: 'history',
  routes: [
    {path: "/", name: "explore", component: Explore, props: true},
    // This is a catch all route in case none of the above matches
    {path: "*", component: NotFound}
  ]
});

let app = new Vue({
    el: "#app",
    router,
    store,
    components: {Explore, CategoryIcon}
});