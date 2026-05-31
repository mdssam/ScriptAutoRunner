chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var tab = tabs[0];
  if (!tab) return;
  var currentURL = tab.url;
  var url = new URL(tab.url);
  var hostname = url.hostname;

  (function() {  
    var DEFAULT_OPTIONS = {
      exclude: ''
    };
    var storageKey = 'SAR';
    
    var vm = new Vue({
      el: '#app',
      data: {
        power: true,
        scripts: [],
        options: {
          exclude: ''
        }
      },
      ready() {
        chrome.storage.local.get([storageKey], (result) => {
          var data = result[storageKey];
          
          // Migrate legacy localStorage if it exists and chrome.storage is empty
          if (!data) {
            var legacyData = window.localStorage.getItem(storageKey);
            if (legacyData) {
              try {
                data = JSON.parse(legacyData);
                // Save migrated data to chrome.storage
                chrome.storage.local.set({ [storageKey]: data });
              } catch(e) {
                console.error('Error parsing legacy localStorage data', e);
              }
            }
          }
          
          if (data) {
            this.$set('power', data.power);
            this.$set('scripts', data.scripts);
            if (data.options) {
              this.$set('options', data.options);
            }
          }
          else {
            this.$set('power', true);
            this.$set('scripts', []);
            this.$set('options', DEFAULT_OPTIONS);
          }
        });
      },
      methods: {
        togglePower() {
          this.power = !this.power;
          this.save();
        },
        toggle(index) {
          var script = this.scripts[index];
          script.enable = !script.enable;
          this.save();
        },
        _setStorage(data) {
          var cleanData = JSON.parse(JSON.stringify(data));
          chrome.storage.local.set({ [storageKey]: cleanData });
        },
        save() {
          this._setStorage(this.$data);
        },
        isMatch(host) {
          if (this.isExcludeHost()) {
            return false;
          }
          if (host === '' || host === 'any') {
            return true;
          }
          var hosts, match;
          if (host.indexOf(',') !== -1) {
            hosts = host.split(',');
            match = hosts.some((_host) => {
              return hostname.indexOf(_host.trim()) !== -1;
            });
          }
          else {
            match = hostname.indexOf(host) !== -1;
          }
          return match;
        },
        isExcludeHost() {
          var host = this.options.exclude;
          if (host === '') {
            return false;
          }
          var hosts, match;
          if (host.indexOf(',') !== -1) {
            hosts = host.split(',');
            match = hosts.some((_host) => {
              return hostname.indexOf(_host.trim()) !== -1;
            });
          }
          else {
            match = hostname.indexOf(host) !== -1;
          }
          return match;
        },
        count() {
          var matched = this.scripts.filter((script) => {
            return this.isMatch(script.host);
          });
          return matched.length === 0 ? true : false;
        },
        openOption() {
          var fileName = 'options.html';
          var url = chrome.runtime.getURL( fileName );
          chrome.tabs.create({
            url: url
          });
        }
      }
    });
  })();
});
