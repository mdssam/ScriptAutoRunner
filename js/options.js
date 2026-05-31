(function() {
  var DEFAULT_SCRIPT = {
    id: null,
    enable: false,
    name: 'Script',
    type: 'snippet',
    src: '',
    code: '',
    host: '',
    _confirmDelete: false
  };

  var DEFAULT_OPTIONS = {
    exclude: ''
  };
  
  var storageKey = 'SAR';
  
  var vm = new Vue({
    el: '#app',
    data: {
      power: true,
      scripts: [],
      options: {},
      isLocked: false,
      fullscreenScript: null
    },
    methods: {
      toggleSwitch() {
        this.power = !this.power;
        this.save();
      },
      addScript(type) {
        var script = _.extend({}, DEFAULT_SCRIPT);
        var id = this._getAvailableId();
        script.id = id;
        script.type = type;
        script.name += id;
        this.scripts.push(script);
      },
      _getAvailableId() {
        if (this.scripts.length === 0) {
          return 0;
        }
        var numbers = _.map(this.scripts, 'id');
        var num = _.max(numbers);
        
        return num + 1;
      },
      confirmRemoveScript(script) {
        if (window.confirm('Are you sure you want to delete "' + script.name + '"?')) {
          this.scripts.$remove(script);
          this.save();
        }
      },
      moveUp(index) {
        var script, temp;
        if (index - 1 >= 0) {
          script = this.scripts[index];
          temp = this.scripts[index - 1];
          this.scripts.$set(index - 1, script);
          this.scripts.$set(index, temp);
        }
      },
      moveDown(index) {
        var script, temp;
        if (index + 1 < this.scripts.length) {
          script = this.scripts[index];
          temp = this.scripts[index + 1];
          this.scripts.$set(index + 1, script);
          this.scripts.$set(index, temp);
        }
      },
      togglePower(index) {
        var script = this.scripts[index];
        script.enable = !script.enable;
        this.save();
      },
      _save() {
        return _.debounce(function() {
          this._setStorage(this.$data);
        }.bind(this), 300);
      },
      onKeyup() {
        this.save();
      },
      onBlur() {
        this.save();
      },
      _setStorage(data) {
        var cleanData = JSON.parse(JSON.stringify(data));
        chrome.storage.local.set({ [storageKey]: cleanData });
      },
      _initAndLoad() {
        chrome.storage.local.get([storageKey, 'SRA', 'isLocked'], (result) => {
          var newData = result[storageKey];
          var legacySRA = result['SRA'];
          var isLockedStored = result['isLocked'];

          if (isLockedStored !== undefined) {
            this.$set('isLocked', isLockedStored);
          } else {
            this.$set('isLocked', false);
          }
          
          if (!newData) {
            // Check legacy localStorage for SAR
            var legacySAR = window.localStorage.getItem(storageKey);
            var legacySRAStr = window.localStorage.getItem('SRA');
            
            if (legacySAR) {
              try {
                newData = JSON.parse(legacySAR);
              } catch(e) {
                console.error(e);
              }
            } else if (legacySRAStr) {
              try {
                newData = JSON.parse(legacySRAStr);
              } catch(e) {
                console.error(e);
              }
            } else if (legacySRA) {
              newData = legacySRA;
            } else {
              newData = { power: true, scripts: [], options: DEFAULT_OPTIONS };
            }
            // Save migrated data to chrome.storage
            chrome.storage.local.set({ [storageKey]: newData });
          }
          
          // Clear legacy data from window.localStorage and chrome.storage 'SRA' to keep it clean
          try {
            window.localStorage.removeItem('SRA');
            window.localStorage.removeItem(storageKey);
          } catch(e) {}
          chrome.storage.local.remove('SRA');

          // Now populate the Vue model
          this.$set('power', newData.power);
          var loadedScripts = newData.scripts || [];
          _.forEach(loadedScripts, function(s) {
            s._confirmDelete = false;
          });
          this.$set('scripts', loadedScripts);
          if (!newData.options) {
            this.$set('options', DEFAULT_OPTIONS);
          } else {
            this.$set('options', newData.options);
          }
          
          // Register Vue watch for auto-save only AFTER the data has been loaded
          this.$watch('scripts', (val, oldVal) => {
            this._setStorage(this.$data);
          }, { deep: true });
        });
      },
      toggleSetting() {
        if (_.includes(this.$els.setting.classList, 'show')) {
          this.$els.setting.classList.remove('show');
        }
        else {
          this.$els.setting.classList.add('show');
        }
      },
      toggleLock() {
        this.isLocked = !this.isLocked;
        chrome.storage.local.set({ isLocked: this.isLocked });
      },
      openFullscreen(script) {
        this.fullscreenScript = script;
        document.body.classList.add('sra-modal-open');
        // Focus the textarea, render highlighting, and sync scroll after DOM updates
        this.$nextTick(function() {
          if (this.$els.editortextarea) {
            this.$els.editortextarea.focus();
            this.updateHighlight();
          }
        }.bind(this));
      },
      closeFullscreen() {
        this.fullscreenScript = null;
        document.body.classList.remove('sra-modal-open');
      },
      updateHighlight() {
        var el = this.$els.highlightcode;
        if (el && this.fullscreenScript) {
          var code = this.fullscreenScript.code || '';
          if (code[code.length - 1] === '\n') {
            code += ' ';
          }
          el.textContent = code;
          if (window.Prism) {
            window.Prism.highlightElement(el);
          }
        }
        this.syncGutterScroll();
      },
      syncEditorScroll() {
        if (this.$els.highlightblock && this.$els.editortextarea) {
          this.$els.highlightblock.scrollTop = this.$els.editortextarea.scrollTop;
          this.$els.highlightblock.scrollLeft = this.$els.editortextarea.scrollLeft;
        }
        this.syncGutterScroll();
      },
      syncGutterScroll() {
        if (this.$els.gutter && this.$els.editortextarea) {
          this.$els.gutter.scrollTop = this.$els.editortextarea.scrollTop;
        }
      }
    },
    computed: {
      lineNumbers() {
        if (!this.fullscreenScript || !this.fullscreenScript.code) {
          return [1];
        }
        var lines = this.fullscreenScript.code.split('\n').length;
        return _.range(1, Math.max(lines, 1) + 1);
      }
    },
    created() {
      this._initAndLoad();
      this.save = this._save();
    }
  });
  
})();
