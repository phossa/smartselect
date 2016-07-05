/**
 * ========================================================
 * SmartSelect - A smart jquery multiple select plugin
 * ========================================================
 *
 * @author     Hong Zhang <smartselect@126.com>
 * @version    1.0.24
 * @since      1.0.23 Added options 'disableUserAlias' and 'enableCollapseAll'
 *                    Added attribute 'data-not-selectable'
 * @since      1.0.24 Added function 'clearAllOptions'
 */

/**
 * @param {window.jQuery} $
 * @param {undefined} undefined
 * @returns {undefined}
 */
;(function($, undefined) {
    //'use strict';

    // PLUGIN NAMING
    // ====================================================

    // phossa projects prefix
    var pluginPrefix    = 'pa';

    // current project name
    var pluginName      = 'smartselect';

    // event namescope
    var eventSuffix     = '.' + pluginPrefix + '.' + pluginName;

    // plugin fullname
    var fullName        = pluginPrefix + '.' + pluginName;

    // SMARTSELECT PLUGIN
    // ====================================================

    /**
     * @description construct the plugin, and attach to an element (<SELECT>)
     * @constructor
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {SmartSelect}
     */
    function SmartSelect(element, options) {

        // normally the <SELECT>
        this.element  = element;

        // caching
        this.$element = $(element);

        // merge user-provided options with default settings
        this.options  = $.extend(true, {}, this.defaults, options);

        // shorthands
        this.o = this.options;
        this.x = this.options.text;
        this.s = this.options.style;
        this.e = this.options.event;
        this.m = this.options.marker;
        this.t = this.options.template;
        this.a = this.options.attribute;

        // callbacks
        this.c = {};
        for (var evt in this.callback) {
            if (this.callback.hasOwnProperty(evt)) {
                this.c[evt] = $.merge([], this.callback[evt]);
                if (this.o.callback[evt])
                    this.addCallback(evt, this.o.callback[evt]);
            }
        }

        // plugin initialization
        this._init();
    };

    SmartSelect.VERSION = '1.0.24';

    // SMARTSELECT PROTOTYPE
    // ====================================================
    SmartSelect.prototype = {

        /**
         * @description default settings
         */
        defaults: {

            // ============================
            // common settings
            // ============================

            /**
             * @description multiple select, enabled by default
             * @type {Boolean}
             */
            multiple: true,

            /**
             * @description set to optimized mode.
             * @type {Boolean}
             */
            optimized: false,

            /**
             * @description delayed init to speed up plugin loading
             * @type {Boolean}
             */
            delayedInit: true,

            /**
             * @description debug switch, 0 for no debug
             * @type {Integer}
             */
            debug: 0,

            /**
             * @description debug level, 2 - 20
             * @type {Integer}
             */
            debugLevel: 10,

            /**
             * @description max data-level allowed
             * @type {Integer}
             */
            maxLevels: 5,

            /**
             * @description set search timeout
             * @type {Boolean}
             */
            searchTimeout: false,

            /**
             * @description alert callback
             * @param {String} text
             * @returns {undefined}
             */
            alert: function(text) {
                alert(text);
            },

            /**
             * @description confirm callback
             * @param {String} text
             * @returns {Boolean}
             */
            confirm: function(text) {
                return confirm(text);
            },

            /**
             * @description special callback to get option special label
             * @param {jQuery} $li
             * @param {SmartSelect} self
             * @returns {String}
             */
            getSpecialLabel: function($li, self) {
                return $li.find('input').val();
            },

            /**
             * @description special callback to set option special value
             * @param {String} value
             * @param {jQuery|undefined} $li
             * @param {SmartSelect} self
             */
            setSpecialValue: function(value, $li, self) {
                var val = value.split(self.o.specialValueSeperator);
                if (val[1] !== undefined) {
                    if ($li === undefined && val[0] !== undefined) {
                        $li = self._getOptionByValue(val[0]);
                    }
                    $li.find('input').val(val[1]);
                }
            },

            /**
             * @description special callback to get option special value
             * @param {jQuery} $li
             * @param {SmartSelect} self
             * @returns {String}
             */
            getSpecialValue: function($li, self) {
                return $li.attr(self.a.dataValue) +
                    self.o.specialValueSeperator +
                    $li.find('input').val();
            },

            /**
             * @description close dropdown after a selection
             * @type {Boolean}
             */
            closeOnSelect: false,

            /**
             * @description close other smartselect dropdowns
             * @type {Boolean}
             */
            closeOtherSmartSelect: true,

            /**
             * @description close smartselect dropdowns if clicked outside
             * @type {Boolean}
             */
            closeOnClickOutside: false,

            /**
             * @description default values, array of strings
             * @type {Array}
             */
            defaultValues: null,

            /**
             * @description initial selected values, array of strings
             * @type {Array}
             */
            initialValues: [],

            /**
             * @description always keep original <SELECT> in sync
             * @type {Boolean}
             */
            keepInSync: true,

            /**
             * @description click group to expand this group
             * @type {Boolean}
             */
            clickGroupOpen: true,

            /**
             * @description display selected options in button
             * @type {Boolean}
             */
            showSelectedInLabel: true,

            /**
             * @description max number of selected option text to display
             * @type {Integer}
             */
            showSelectedCount: 2,

            /**
             * @description callback to display selected option text.
             * @example
             * var showMyLabel = function(labels) {
             *     var txt = this.o.text.selectLabel + ': ';
             *     for(var i = 0; i < labels.length; i++) {
             *         txt += labels[i];
             *     }
             *     return txt;
             * }
             * showMyLabel.call(this, labels);
             *
             * @type {Function(Array): String}
             */
            showSelectedCallback: null,

            /**
             * @description seperator used in displaying option text
             * @type {String}
             */
            showSelectedSeperator: ',',

            /**
             * @description seperator used in get/set special value
             * @type {String}
             */
            specialValueSeperator: '::',

            /**
             * @description default view, can be combined with '+'
             * @example
             *
             * 'root':          view root level only
             * 'view':          respect 'data-view'
             * 'selected':      selected options and its upper levels
             * 'expand':        expand all levels
             * 'level1':        expand up to data-level = 1
             * 'level2':        expand up to data-level = 2
             *
             * @type {String}
             */
            defaultView: 'root+selected+view',

            /**
             * @description auto click this.$buttonView after ...
             * @type {Boolean}
             */
            viewAfterCheckAll:  true,
            viewAfterCancel: true,
            viewAfterAlias: true,

            /**
             * @description force click buttonUnCheck trigger event
             * @type {Boolean}
             * @since 1.0.21
             */
            forceUnCheckTriggerEvent: false,

            /**
             * @description close after click an alias
             * @type {Boolean}
             */
            closeAfterAlias: true,

            /**
             * @description user is unable to change aliases
             * @type {Boolean}
             * @since 1.0.23
             */
            disableUserAlias: false,

            /**
             * @description collapse all if click buttonUnfold again
             * @type {Boolean}
             * @since 1.0.23
             */
            enableCollapseAll: true,

            /**
             * @descript search by 'label', 'value' or 'both'
             * @type {String}
             */
            searchBy: 'label',

            /**
             * @description search case-insensitive or not
             * @type {Boolean}
             */
            searchCaseInsensitive: true,

            /**
             * @description number of selected options required
             * @type {Integer}
             */
            atLeast: 0,

            /**
             * @description max number of selected options allowed, 0 is no limit
             * @type {Integer}
             */
            atMost: 0,

            /**
             * @description must selected options in array of values
             * @type {Array}
             */
            mustSelect: [],

            /**
             * @description upper/lower level exclusive or not
             * @type {Boolean}
             */
            dataLevelInclusive: false,

            // ============================
            // style class names
            // ============================
            style: {
                // container
                container:      'dropdown',

                // select button
                select:         'dropdown-toggle btn btn-default',
                selectIcon:     '',
                selectLabel:    '',
                selectCaret:    'caret',

                // dropdown style
                dropdown:       'dropdown-menu',

                // toolbar style
                toolbarPos:     '',
                toolbar:        'btn-group-vertical',

                // toolbar button style
                button:         'btn btn-default',

                // toolbar button with dropdown
                buttonGroup:    'btn-group',
                buttonToggle:   'btn btn-default dropdown-toggle',
                buttonCaret:    'caret',
                buttonDropdown: 'dropdown-menu pull-right',

                // <li> input style
                liInput:        'form-group-sm',
                inputBox:       'form-control',

                // button icons
                buttonView:     'fa fa-fw fa-eye',
                buttonUnfold:   'fa fa-fw fa-folder-o',
                buttonFoldOpen: 'fa fa-fw fa-folder-open-o',
                buttonCancel:   'fa fa-fw fa-undo',
                buttonCheckAll: 'fa fa-fw fa-check',
                buttonUnCheck:  'fa fa-fw fa-times',
                buttonSearch:   'fa fa-fw fa-search',

                // folder icons
                folderOpen:     'fa fa-folder-open-o',
                folderClose:    'fa fa-folder-o',

                // divider
                divider:        'divider',

                // checker style
                checker:        'fa fa-fw fa-check-square-o',
                checkerNo:      'fa fa-fw fa-square-o',

                // dropup style
                dropup:         'dropup',

                // alias
                buttonAlias:    'fa fa-fw fa-star-o',
                alias:          '',
                aliasIcon:      'fa fa-star-o',
                aliasCaret:     'fa fa-times'
            },

            // ============================
            // predefined marker names
            // ============================
            marker: {

                // display markers
                container:      'smartselect',

                label:          'ss-label',
                caret:          'ss-caret',
                icon:           'ss-icon',

                toolbar:        'ss-toolbar',

                // divider marker
                divider:        'ss-divider',

                // hide marker & prefix
                hide:           'ss-hide',

                // status markers, compatible with bootstrap
                open:           'open',
                active:         'active',
                disabled:       'disabled',

                // folder marker
                folder:         'ss-folder',
                folderOpen:     'ss-open',
                folderClose:    'ss-close',

                // expand/collapse all marker icon
                expandAll:      'fa-folder-open-o',

                // toolbutton
                button:         'ss-button',

                // optgroup marker
                group:          'ss-group',
                noGroup:        'ss-nogrp',

                // option marker
                option:         'ss-option',
                optionNotSelectable: 'ss-option-off',

                // checker
                checker:        'ss-checker',
                checkerNo:      'ss-checkno',

                // no click bubble up
                noBubble:       'ss-nobubble',

                // alias line
                alias:          'ss-alias'
            },

            // ============================
            // html templates
            // ============================
            template: {
                // container
                container:      '<div></div>',

                // select button
                select:         '<button type="button"><i class="ss-icon"></i><span class="ss-label"></span><i class="ss-caret"></i></button>',

                // dropdown
                dropdown:       '<ul></ul>',

                // toolbar
                toolbar:        '<li><div role="toolbar"></div></li>',

                // tool button
                button:         '<button type="button"><i class="ss-icon"></i></button>',

                // button for toggle
                buttonToggle:   '<button type="button"><i class="ss-icon"></i><i class="ss-caret"></i></button>',

                // button group
                buttonGroup:    '<div></div>',

                // button input box
                liInput:        '<li><div><input type="text" /></div></li>',

                // divider
                divider:        '<li class="ss-divider"></li>',

                // alias
                alias:          '<li class="ss-alias"><a><i class="ss-icon"></i><i class="ss-caret"></i><span class="ss-label"></span></a></li>',

                // folder
                folder:         '<i class="ss-folder ss-close"></i><i class="ss-folder ss-open"></i>'
            },

            // ============================
            // toolbar & buttons
            // ============================
            toolbar: {
                buttonSearch:   true,
                buttonAlias:    true,
                buttonView:     'root+selected',
                buttonUnfold:   true,
                buttonCancel:   true,
                buttonCheckAll: true,
                buttonUnCheck:  true
            },

            // ============================
            // event
            // ============================
            event: {
                click:          'click',
                buttonClick:    'click',
                optionSelect:   'click',
                dropdownToggle: 'click'
            },

            // ============================
            // predefined attributes for <OPTION> and <OPTGROUP>
            // ============================
            attribute: {
                dataView:           'data-view',
                dataMust:           'data-must',
                dataLevel:          'data-level',
                dataValue:          'data-value',
                dataUpper:          'data-upper',
                dataAtMost:         'data-atmost',
                dataSpecial:        'data-special',
                dataDivider:        'data-divider',
                dataAtLeast:        'data-atleast',
                dataExclusive:      'data-exclusive',
                dataInclusive:      'data-inclusive',
                dataNotSelectable:  'data-not-selectable',
                dataLevelInclusive: 'data-level-inc',
                dataGroupExclusive: 'data-group-exclusive'
            },

            // ============================
            // text
            // ============================
            text: {
                // default select button text
                selectLabel:        'Smart Select',
                labelTemplate:      '# selected',
                disabled:           'Disabled',

                // button title
                buttonSearch:   'search options',
                buttonAlias:    'option aliases',
                buttonView:     'view only selected',
                buttonUnfold:   'expanded/collapse view',
                buttonCancel:   'cancel selected options',
                buttonCheckAll: 'select all',
                buttonUnCheck:  'deselect all',

                // placeholder
                aliasPlaceholder:   'Save as alias',
                searchPlaceholder:  'Search ...',

                // error messages
                groupExcludeError:  '"data-atleast" can not use with "data-group-exclusive"',
                callbackError:      'unknown callback ',
                valueSetError:      'set value error ',
                invalidOptionError: 'invalid option',
                badArgumentError:   'bad argument ',
                emptyValuesError:   'no option selected',
                aliasDupError:      'alias duplicated',
                duplicationError:   'duplicated option found'
            },

            // ============================
            // status change event handlers
            // ============================
            handler: {},

            // ============================
            // user-defined callbacks
            // ============================
            callback: {},

            /**
             * @description data, instead of extracting from <SELECT>
             * @type {Array}
             */
            data: [],

            /**
             * @description predefined aliases
             * @type {Object}
             */
            aliases: {}
        },

        /**
         * @description internal callbacks
         * @type {Object}
         */
        callback: {
            onPluginLoad: [

                // resolve conflict options
                '_fixPluginOptions',

                // hide original <SELECT>
                '_hideOriginalSelect'
            ],

            onPluginLoaded:[

                // set default values first
                '_setDefaultValues',

                // verify empty logic
                '_fixEmptyLogic',

                // sync to <SELECT>
                '_flushSelect',

                // update display label
                '_setSelectLabel',

                // set lable to alias name if matches
                '_matchAliasName',

                // force sync select
                '_syncSelect',

                // disabled initially ?
                // added 1.0.21
                '_disabledSelect'
            ],

            onDropdownShow: [

                // apply delayed init for first time
                '_delayedInit'
            ],

            onDropdownShown: [

                // save old values for buttonCancel
                '_saveOldValues',

                // update folder icons
                '_updateIcons'
            ],

            onDropdownHide: [],

            onDropdownHidden: [

                // force sync to <SELECT> on dropdown hidden
                '_syncSelect'
            ],

            onOptionChange: [],

            onOptionChanged: [

                // flush to <SELECT> (not forced)
                '_flushSelect',

                // update display label
                '_setSelectLabel',

                // set lable to alias name if matches
                '_matchAliasName',

                // closeOnSelect in single select case
                '_closeOnSelect'
            ],

            onOptionDisable: [],

            onOptionDisabled: [
                '_fixEmptyLogic'
            ],

            onOptionSelect: [

                // check atMost
                '_atMost'

            ],

            onOptionSelected: [

                // verify select logic
                '_fixSelectLogic'
            ],

            onOptionDeselect: [

                // verify unselect/empty logic
                '_fixEmptyLogic'
            ],

            onOptionDeselected: []
        },

        // ============================
        // public methods
        // ============================

        /**
         * @description select options base on values, clear all first,
         * @param {Array} values array of strings
         * @param {Boolean} clear set to FALSE to disable clearing
         * @returns {Object} this
         * @public
         */
        selectOptions: function(values, clear) {

            this._debug('selectOptions');

            // whole plugin disbled ?
            if (this.isDisabled()) return this;

            if (this._triggerEvent('onOptionChange')) {

                // uncheck everything
                if (clear !== false) this._clearValues();

                // set values
                this._setValues(values);

                // fix logic for possible missings
                if (clear !== false) this._fixEmptyLogic();

                this._triggerEvent('onOptionChanged');
            }

            return this;
        },

        /**
         * @description deselect options base on values
         * @param {Array} values
         * @returns {Object} this
         * @public
         */
        deselectOptions: function(values) {

            this._debug('deselectOptions');

            // whole plugin disbled ?
            if (this.isDisabled()) return this;

            if (this._triggerEvent('onOptionChange')) {

                // unset values
                this._unSetValues(values);

                this._triggerEvent('onOptionChanged');
            }

            return this;
        },

        /**
         * @description get selected values in array
         * @returns {Array}
         * @public
         */
        getValues: function() {

            this._debug('getValues');

            // whole plugin disbled ?
            if (this.isDisabled()) return [];

            var result = this.getSelectedPairs();

            return result.value;
        },

        /**
         * @description is whole select disabled ?
         * @returns {Boolean}
         * @public
         */
        isDisabled: function() {
            return this.$select.hasClass(this.m.disabled);
        },

        /**
         * @description disable the plugin
         * @returns {Object} this
         * @public
         */
        disableSelect: function() {

            this._debug('disableSelect');

            if (this.isDisabled()) return this;

            // force close dropdown
            this.closeDropdown();

            // disable select
            this.$select.addClass(this.m.disabled);

            // update label with a disabled notice
            this._setSelectLabel(this.x.disabled);

            // added 1.0.21, sync with <SELECT>
            if (this._isSelect) {
                this.$element.prop('disabled', true);
            }
            return this;
        },

        /**
         * @description enable the plugin
         * @returns {Object} this
         * @public
         */
        enableSelect: function() {

            this._debug('enableSelect');

            if (this.isDisabled()) {
                this.$select.removeClass(this.m.disabled);
                this._triggerEvent('onOptionChanged');

                // added 1.0.21, sync with <SELECT>
                if (this._isSelect) {
                    this.$element.prop('disabled', false);
                }
            }

            return this;
        },

        /**
         * @description disable options base on given values
         * @param {Array} values
         * @returns {Object} this
         * @public
         */
        disableOptions: function(values) {

            this._debug('disableOptions');

            if (this.isDisabled()) return this;

            var $todo = $();
            if (values) {
                for (var i in values) {
                    var $li = this._getOptionByValue(values[i]);
                    if (!$li.hasClass(this.m.disabled)) {
                        $todo = $todo.add($li);
                    }
                }
            } else {
                $todo = this.$dropdown
                    .find('.' + this.m.option).not('.' + this.m.disabled);
            }

            var self = this;
            $todo.each(function() {
                var $li = $(this);
                $li.addClass(self.m.disabled);
                self._triggerEvent('onOptionDisabled', $li);
            });

            this._triggerEvent('onOptionChanged');

            return this;
        },

        /**
         * @descriptoin enable options base on given values
         * @param {Array} values
         * @returns {Object} this
         * @public
         */
        enableOptions: function(values) {

            this._debug('enableOptions');

            if (this.isDisabled()) return this;

            // enable
            var $disabled = $();
            if (values) {
                for (var i in values) {
                    var $li = this._getOptionByValue(values[i]);
                    if ($li.hasClass(this.m.disabled)) {
                        $disabled = $disabled.add($li);
                    }
                }
            } else {
                $disabled = this.$dropdown
                        .find('.' + this.m.disabled + '.' + this.m.option);
            }

            // enable those
            var self = this;
            $disabled.each(function() {
                var $li = $(this);
                $li.removeClass(self.m.disabled);
                self._triggerEvent('onOptionEnabled', $li);
            });

            this._triggerEvent('onOptionChanged');

            return this;
        },

        /**
         * @description add an option to the plugin
         * @example
         * var info = {
         *   label: 'text',
         *   value: 'x',
         * }
         *
         * @param {Object} info
         * @param {ValueString,HTHMLElement,jQuery} after
         * @param {ValueString,HTHMLElement,jQuery} parent
         * @returns {Object} this
         * @public
         */
        addOption: function(info, after, parent) {

            this._debug('addOption');

            var self = this;

            // check duplcates
            var $opt = this._getOptionByValue(info.value);
            if ($opt.length) {
                // trigger a status event
                $opt.trigger('optionDuplicated' + eventSuffix);
                return this;
            }

            // tmp variables
            var $s, $g, uids = [];

            // parent provided (option or group)
            if (parent) {

                var $p = this._getOptionByValue(parent);

                // parent is a group
                if ($p.hasClass(this.m.group)) {
                    $g = $p;
                    info.level = 1;

                // parent is an option
                } else {
                    $g = this._getGroup($p);
                    this._getUpperLevels($p, function($x) {
                        var level = parseInt($x.attr(self.a.dataLevel));
                        uids[level] = $x.attr('id');
                    });
                    info.level = parseInt($p.attr(self.a.dataLevel)) + 1;

                    // add folder to the parent
                    if ($p.find('.' + this.m.folder).length === 0) {
                        $p.children('a').append(this.t.folder);
                        $p.find('.' + this.m.folder + '.' + this.m.folderOpen)
                            .addClass(this.s.folderOpen);
                        $p.find('.' + this.m.folder + '.' + this.m.folderClose)
                            .addClass(this.s.folderClose);
                    }
                }

                // do have a group
                if ($g.length) {
                    uids[0] = $g.attr('id');
                    info.ingroup = true;
                }

                // find <LI> to insert after
                $s = this.$dropdown.find('.' + $p.attr('id')).last();
                if ($s.length === 0) $s = $p;

            // after an option
            } else if (after) {

                $s = this._getOptionByValue(after);
                $g = this._getGroup($s);

                this._getUpperLevels($s, function($x) {
                    var level = parseInt($x.attr(self.a.dataLevel));
                    uids[level] = $x.attr('id');
                }, false);

                if ($g.length) {
                    uids[0] = $g.attr('id');
                    info.ingroup = true;
                }
                info.level = parseInt($s.attr(self.a.dataLevel));

                // if $s has sublevels, add after subs
                if (this.$dropdown.find('.' + $s.attr('id')).length) {
                    $s = this.$dropdown.find('.' + $s.attr('id')).last();
                }

            // insert to the root of this.$dropdown (end)
            } else {
                info.level = 1;
            }

            // default no group
            if (info.ingroup === undefined) info.ingroup = false;

            // build html
            var oid  = this._getOid();
            var html = this._buildOptionHtml(info, oid, uids);

            // find position to insert
            $s ? $s.after(html) : this.$dropdown.append(html);

            // insert to data mapping
            var mapping = this.$dropdown.data('mapping');
            mapping[info.value] = oid;
            this.$dropdown.data('mapping', mapping);

            // trigger a status event
            this._getOptionByValue(info.value).trigger('optionAdded' + eventSuffix);

            // adjust viewing
            if (this.$dropdown.is(':visible')) {
                this._expandAllLevels();
                this._updateIcons();
            }

            return this;
        },

        /**
         * @description remove an option
         * @param {ValueString} value
         * @returns {Object} this
         * @public
         */
        removeOption: function(value) {

            this._debug('removeOption');

            var $opt = this._getOptionByValue(value);
            if ($opt.length) {

                // delete html
                $opt.remove();

                // update mapping
                var mapping = this.$dropdown.data('mapping');
                delete mapping[value];
                this.$dropdown.data('mapping', mapping);

                // trigger a status event
                this.$element.trigger('optionRemoved' + eventSuffix);

                // changed
                this._triggerEvent('onOptionChanged');
                this._updateIcons();
            }

            return this;
        },

        /**
         * @description clear all options
         * @returns {Object} this
         * @public
         * @since 1.0.24
         */
        clearAllOptions: function() {
            this._debug('clearAllOptions');

            // all options
            var $allOpts = this.$dropdown.find('.' + this.m.option);

            // number of select options
            var $actives = $allOpts.find('.' + this.m.active)
                .not('.' + this.m.disabled).length;

            // if has options
            if ($allOpts.length) {
                // close dropdown
                this.toggleDropdown(true);

                // update backend SELECT
                this.$element.empty();

                // empty the dropdown
                this.$dropdown.empty().data('mapping', {});

                // make sure will rebuild the toolbar & events binding
                this._delayed = false;

                // trigger a status event
                this.$element.trigger('optionRemoved' + eventSuffix);

                // changed
                if ($actives > 0) {
                    this._triggerEvent('onOptionChanged');
                }

                // update button label
                this._setSelectLabel();

                // update icons
                this._updateIcons();
            }

            return this;
        },

        /**
         * @description get group object base on the given name to match
         * @param {String|jQuery} name name to match or a jquery
         * @returns {jQuery}
         * @public
         */
        getGroup: function(name) {

            this._debug('getGroup');

            if (name.jquery) return name;

            var $gp  = $();
            var self = this;

            this.$dropdown.find('.' + this.m.group)
                .each(function() {
                    var label = $(this).find('.' + self.m.label).text();
                    if (label.indexOf(name) > -1) {
                        $gp = $(this);
                        return false;
                    }
                });
            return $gp;
        },

        /**
         * @description get selected value/label in object
         * @returns {Object}
         * @public
         */
        getSelectedPairs: function() {

            this._debug('getSelectedPairs');

            if (this.isDisabled()) return undefined;

            var result = { value: [], label: {}, text: [] };
            var self   = this;

            this._getSelectedOptions().each(function() {
                var $jq = $(this);
                var val = self._getOptionValue($jq);
                var txt = self._getOptionLabel($jq);

                result.label[val] = txt;
                result.value[result.value.length] = val;
                result.text[result.text.length]   = txt;
            });

            return result;
        },

        /**
         * @description open dropdown
         * @returns {Object} this
         * @public
         */
        openDropdown: function() {
            return this.toggleDropdown(false);
        },

        /**
         * @description close dropdown
         * @returns {Object} this
         * @public
         */
        closeDropdown: function() {
            return this.toggleDropdown(true);
        },

        /**
         * @description toggle dropdown
         * @param {Boolean} hideDropdown TRUE force hide, FALSE force open
         * @returns {Object} this
         * @public
         */
        toggleDropdown: function(hideDropdown) {

            this._debug('toggleDropdown');

            if (this.isDisabled()) return this;

            var hide = this.$container.hasClass(this.m.open) ? true : false;
            if (hideDropdown === false) hide = false;
            if (hideDropdown === true)  hide = true;

            // hide
            if (hide) {
                if (this._triggerEvent('onDropdownHide', this.$container)) {
                    this.$container.removeClass(this.m.open);
                    this._triggerEvent('onDropdownHidden', this.$container);
                }

            // show
            } else {
                if (this._triggerEvent('onDropdownShow', this.$container)) {
                    if (this.o.closeOtherSmartSelect) {
                        $('.' + this.m.container)
                            .filter('.' + this.m.open)
                            .not(this.$container)
                            .each(function() {
                                var elem = $(this).data(fullName);
                                $(elem).data(fullName).closeDropdown();
                            });
                    }
                    this.$container.addClass(this.m.open);
                    this._triggerEvent('onDropdownShown', this.$container);
                }
            }

            return this;
        },

        /**
         * @description expand this option
         * @param {ValueString,HTHMLElement,jQuery} li
         * @returns {Object} this
         * @public
         */
        unfoldOption: function(li) {
            this._getOptionByValue(li).find('.' + this.m.folderClose).trigger('click');
        },

        /**
         * @description select or deselect an option
         * @param {ValueString,HTHMLElement,jQuery} li
         * @param {Boolean} triggerChange set FALSE to disable
         * @param {Boolean} setOption TRUE force select, FALSE force deselect
         * @returns {Object} this
         * @public
         */
        toggleOption: function(li, triggerChange, setOption) {

            this._debug('toggleOption');

            if (this.isDisabled()) return this;

            // select by value
            var $li = li.jquery ? li : this._getOptionByValue(li);
            if ($li.length === 0) {
                throw new Error(this.x.invalidOptionError);
                return this;
            }

            // trigger 'onOptionChanged' or not
            var trigger = triggerChange === false ? false : true;

            // disabled?
            if ($li.hasClass(this.m.disabled)) return this;

            // before change
            if (trigger && !this._triggerEvent('onOptionChange', $li))
                return this;

            var active =  $li.hasClass(this.m.active);

            // unselect
            if (setOption === false || active) {
                this._deselectOption(li);
            }

            // select
            if (setOption === true || !active) {
                this._selectOption(li);
            }

            // after change
            if (trigger && !this._triggerEvent('onOptionChanged', $li))
                return this;

            return this;
        },

        /**
         * @descript add a callback for procedural event callbacks
         * @param {EventString} event short event name
         * @param {Callback,Array} callback or array of callbacks
         * @returns {Object} this
         * @public
         */
        addCallback: function(event, callback) {

            this._debug('addCallback');

            if (this.c[event]) {
                if ($.isArray(callback)) {
                    $.merge(this.c[event], callback);
                } else {
                    this.c[event].push(callback);
                }
            } else {
                this.o.alert(this.x.callbackError + event);
            }

            return this;
        },

        /**
         * @description force select an option
         * @param {ValueString,HTHMLElement,jQuery} li
         * @param {Boolean} triggerChange FALSE to disable
         * @returns {Object} this
         * @public
         */
        selectOption: function(li, triggerChange) {

            this._debug('selectOption');

            // force select
            return this.toggleOption(li, triggerChange, true);
        },

        /**
         * @description force select an option
         * @param {ValueString,HTHMLElement,jQuery} li
         * @param {Boolean} triggerChange FALSE to disable
         * @returns {Object} this
         * @public
         */
        deselectOption: function(li, triggerChange) {

            this._debug('deselectOption');

            // force deselect
            return this.toggleOption(li, triggerChange, false);
        },

        /**
         * @description select all options
         * @returns {Object} this
         * @public
         */
        selectAllOptions: function() {

            this._debug('selectAllOptions');

            if (this.isDisabled()) return this;

            // always clear value first
            this._clearValues();

            // get all non-disabled groups
            var $groups = this._getGroup().not('.' + this.m.disabled);

            // select in group
            var self = this;
            $groups.each(function() {
                var $grp = $(this);
                self.selectGroupOptions($grp, false);
            });

            // select all options in root
            self.selectGroupOptions();

            return this;
        },

        /**
         * @description deselect all options
         * @param {Boolean} forceTriggerEvent TRUE to force trigger event
         * @returns {Object} this
         * @public
         */
        deselectAllOptions: function(forceTriggerEvent) {

            this._debug('deselectAllOptions');

            if (this.isDisabled()) return this;

            /* added 1.0.20 */
            if (forceTriggerEvent === true) {
                this.deselectOptions(this.getValues());
            } else {
                this.$dropdown
                    .find('.' + this.m.active + '.' + this.m.option)
                    .not('.' + this.m.disabled)
                    .removeClass(this.m.active);
            }

            // fire callbacks without trigger event
            this._fireCallbacks('onPluginLoaded', this.$element);

            return this;
        },

        /**
         * @description select all options in a group
         * @param {String,jQuery} $group undefined means root level
         * @param {Boolean} triggerChange FALSE to disable
         * @returns {Object} this
         * @public
         */
        selectGroupOptions: function($group, triggerChange) {

            this._debug('selectGroupOptions');

            if (this.isDisabled()) return this;

            var inc = this._isLevelInclusive($group);
            if ($group) {
                $group    = this.getGroup($group);
                var gid   = $group.attr('id');
                var $opts = this.$dropdown
                        .find('.' + gid + '.' + this.m.option +
                        (inc ? '' : '.' + this.a.dataLevel + '-1'))
                        .not('.' + this.m.disabled)     // ignore disabled options
                        .not('.' + this.a.dataSpecial); // ignore special options
            } else {
                var $opts = this.$dropdown
                        .find('.' + this.m.noGroup + '.' + this.m.option +
                        (inc ? '' : '.' + this.a.dataLevel + '-1'))
                        .not('.' + this.m.disabled)
                        .not('.' + this.a.dataSpecial);
            }

            if (this._isGroupMultiple($group) && !this._isAtMost()) {

                // test first one (might conflit with other groups etc.)
                this._selectOption($opts.first());

                // select the rest
                this._quickSelectOptions($opts, triggerChange);

            } else {
                return this._selectMatchedOptions($opts, true, true, triggerChange);
            }
        },

        /**
         * @description deselect all options in one group
         * @param {String,jQuery} $group undefined means root level
         * @param {Boolean} triggerChange FALSE to disable
         * @returns {Object} this
         * @public
         */
        deselectGroupOptions: function($group, triggerChange) {

            this._debug('deselectGroupOptions');

            if (this.isDisabled()) return this;

            if ($group) {
                $group    = this.getGroup($group);
                var gid   = $group.attr('id');
                var $opts = this.$dropdown
                    .find('.' + this.m.active + '.' + gid)
                    .filter('.' + this.m.option)
                    .not('.'  + this.m.disabled);
            } else {
                var $opts = this.$dropdown
                    .find('.' + this.m.active + '.' + this.m.option)
                    .filter('.' + this.m.noGroup)
                    .not('.'  + this.m.disabled);
            }
            if ($opts.length === 0) return this;

            if (this._isGroupMultiple($group)) {

                // deselect all active
                this._quickSelectOptions($opts, triggerChange, false);

            } else {

                // deselct those matched
                this._selectMatchedOptions($opts, false, true, triggerChange);
            }

            return this;
        },

        /**
         * @description set alias 'name' with 'value'
         * @param {String,Object} name or object
         * @param {Array} value array of value strings
         * @param {Boolean} syncLabel FALSE to disable sync label
         * @param {Boolean} syncAlias FALSE to disable sync alias
         * @returns {Object} this
         * @public
         */
        addAlias: function(name, value, syncLabel, syncAlias) {

            this._debug('addAlias');

            if (this.isDisabled()) return this;

            // add single alias
            if (typeof name === 'string') {
                if (!$.isArray(value)) value = [ value ];

                // remove duplication
                for (var n in this.o.aliases) {

                    // remove same values
                    if (this._arrayEqual(this.o.aliases[n], value)) {
                        if (this.o.confirm(this.x.aliasDupError)) {
                            this.removeAlias(n, false, false);
                        } else {
                            return this;
                        }
                    }

                    // remove same name
                    if (n === name) {
                        if (this.o.confirm(this.x.aliasDupError)) {
                            this.removeAlias(n, false, false);
                        } else {
                            return this;
                        }
                    }
                }

                this.o.aliases[name] = value;

            // add multiple aliases
            } else {
                for (var n in name) {
                    this.addAlias(n, name[n], false, false);
                }
                this._matchAliasName();
                return this;
            }

            // update button label with alias name if matches
            if (syncLabel !== false) this._matchAliasName();

            // add alias line
            this._addAliasLine(name);

            // trigger a status change event
            if (syncAlias !== false) {
                this.$element.trigger('aliasChange' + eventSuffix);
            }

            return this;
        },

        /**
         * @description remove alias 'name'
         * @param {String,Array} name
         * @param {Boolean} syncLabel FALSE to disable sync label
         * @param {Boolean} syncAlias FALSE to disable sync alias
         * @returns {Object} this
         * @public
         */
        removeAlias: function(name, syncLabel, syncAlias) {

            this._debug('removeAlias');

            if (this.isDisabled()) return this;

            // remove a single alias
            if (typeof name === 'string') {
                delete this.o.aliases[name];

            // remove array of aliases
            } else if ($.isArray(name)) {
                for (var i in name) {
                    this.removeAlias(name[i], false, false);
                }

                this._setSelectLabel();
                this._matchAliasName();
                this.$element.trigger('aliasChange' + eventSuffix);

                return this;
            }

            // update button label with alias name if matches
            if (syncLabel !== false) {
                this._setSelectLabel();
                this._matchAliasName();
            }

            // remove the alias in this.$buttonAlias
            if (this.$buttonAlias) {
                var self = this;
                this.$buttonAlias.find('.' + this.m.label)
                    .each(function() {
                        if ($(this).text() === name) {
                            $(this).closest('.' + self.m.alias).remove();
                        }
                    });
            }

            // trigger a status change event
            if (syncAlias !== false) {
                this.$element.trigger('aliasChange' + eventSuffix);
            }

            return this;
        },

        /**
         * @description click on alias 'name'
         * @param {String} name
         * @returns {Object} this
         * @public
         */
        selectAlias: function(name) {
            this.$buttonAlias.find('.' + this.m.label)
                .each(function() {
                    if ($(this).text() === name) {
                        $(this).click();
                        return false;
                    }
                });

            return this;
        },

        /**
         * @description force sync plugin with original <SELECT>
         * @returns {Object} this
         * @public
         */
        syncSelect: function() {

            this._debug('syncSelect');

            this._syncSelect();

            return this;
        },

        // ============================
        // private methods
        // ============================

        /**
         * @description plugin initialization
         * @private
         */
        _init: function() {

            this._debug('_init');

            // before plugin load
            if (this._triggerEvent('onPluginLoad')) {

                // get data
                var data = [];
                if (this._isSelect) {
                    this._extractSelectData(data);
                } else {
                    data = this.o.data;
                }
                this._buildPlugin(data);

                // after plugin loaded
                this._triggerEvent('onPluginLoaded');
            }
        },

        /**
         * @description show debug messages in console
         * @param {String} str
         * @param {Integer} level
         * @private
         */
        _debug: function(str, level) {

            var start = 2;
            try {
                if (level === undefined) {
                    level = 0;
                    var func = arguments.callee.caller;
                    while (func) {
                        if (++level > 20) break;
                        func = func.caller;
                    }
                }
            } catch (e) {
                level = 2;
            }

            if (this.o.debug && level <= this.o.debugLevel) {
                console.log(this._stringRepeat('    ', level - start) +
                        level + ' ' + str + ' '  + ++this.o.debug
                );
            }
        },

        /**
         * @description select the option, no sync to <SELECT>
         * @param {ValueString,HTHMLElement,jQuery} li
         * @param {Boolean} triggerEvent FALSE to disable
         * @returns {Boolean}
         * @private
         */
        _selectOption: function(li, triggerEvent) {

            this._debug('_selectOption');

            // special value case ?
            if (typeof li === 'string' &&
                li.indexOf(this.o.specialValueSeperator) > -1) {
                var setValue = li;
            }

            // select by value
            var $li = li.jquery ? li : this._getOptionByValue(li);

            if ($li.length === 0) return false;

            // set special value
            if (setValue) {
                this.o.setSpecialValue(setValue, $li, this);
            }

            // trigger 'onOptionSelected' or not
            var trigger = triggerEvent ===  false ? false : true;

            // selected already ?
            if ($li.hasClass(this.m.active)) return true;

            // disabled?
            if ($li.hasClass(this.m.disabled)) return false;

            // trigger event
            if (trigger && !this._triggerEvent('onOptionSelect', $li))
                return false;

            // update status
            $li.addClass(this.m.active);

            // trigger event
            if (trigger && !this._triggerEvent('onOptionSelected', $li))
                return false;

            return true;
        },

        /**
         * @description deselect the option, no sync to <SELECT>
         * @param {ValueString,HTHMLElement,jQuery} li
         * @param {Boolean} triggerEvent FALSE to disable
         * @returns {Boolean}
         * @private
         */
        _deselectOption: function(li, triggerEvent) {

            this._debug('_deselectOption');

            // unselect by value
            var $li = li.jquery ? li : this._getOptionByValue(li);
            if ($li.length === 0) return false;

            // trigger 'onOptionDeselect' or not
            var trigger = triggerEvent === false ? false : true;

            // unselected already ?
            if (!$li.hasClass(this.m.active)) return true;

            // disabled?
            if ($li.hasClass(this.m.disabled)) return false;

            // trigger event
            if (trigger && !this._triggerEvent('onOptionDeselect', $li))
                return false;

            // update status
            $li.removeClass(this.m.active);

            // trigger event
            if (trigger && !this._triggerEvent('onOptionDeselected', $li))
                return false;

            return true;
        },

        /**
         * @description trigger a procedural event and fire predefined callbacks
         * @param {EventString} event short event name
         * @param {jQuery} $target if undefined, use this.$element
         * @returns {Boolean}
         * @private
         */
        _triggerEvent: function(event, $target) {

            this._debug('EVENT ' + event);

            var $tg = $target ? $target : this.$element;

            // wakeup event listeners
            $tg.trigger(event + eventSuffix);

            // fire callbacks
            return this._fireCallbacks(event, $tg);
        },

        /**
         * @description fireup callbacks
         * @param {EventString} event short event name
         * @param {jQuery} $tg event target
         * @returns {Boolean}
         * @private
         */
        _fireCallbacks: function(event, $tg) {

            var cb  = this.c[event];
            var res = true;
            for (var i in cb) {
                if (typeof cb[i] === 'string') {
                    res = this[cb[i]].call(this, $tg, event);
                } else {
                    res = cb[i].call(this, $tg, event);
                }
                if (res === false) return false;
            }

            return true;
        },

        /**
         * @description toggle folder icon display
         * @param {jQuery} $li
         * @private
         */
        _toggleFolder: function($li) {

            this._debug('_toggleFolder');

            var self = this;

            $li.each(function(i, element) {
                var $jq   = $(element);
                var $subs = self.$dropdown.find('.' + $jq.attr('id'));
                var level = $jq.hasClass(self.m.group) ?
                    1 : parseInt($jq.attr(self.a.dataLevel)) + 1;

                // collapse
                if ($jq.hasClass(self.m.open)) {
                    $jq.removeClass(self.m.open);
                    $subs.addClass(self.m.hide + '-' + level);

                // expand
                } else {
                    $jq.addClass(self.m.open);
                    $subs.removeClass(self.m.hide + '-' + level);
                }
            });
        },

        /**
         * @description get option by its value or other ids
         * @param {ValueString,HTHMLElement,jQuery} val
         * @returns {jQuery}
         * @private
         */
        _getOptionByValue: function(val) {

            this._debug('_getOptionByValue');

            // DOM
            if (val.nodeName !== undefined) return $(val);

            // jquery
            if (val.jquery) return val;

            // value
            val = val.toString();

            // special value case
            if (val.indexOf(this.o.specialValueSeperator) > -1) {
                val = val.split(this.o.specialValueSeperator)[0];
            }

            var data = this.$dropdown.data('mapping');
            if (data[val]) return $('#' + data[val]);

            return $();
        },

        /**
         * @description get the group for $li OR all groups if undefined
         * @param {jQuery} $li
         * @returns {jQuery}
         * @private
         */
        _getGroup: function($li) {

            this._debug('_getGroup');

            var $grp = $();
            var $groups = this.$dropdown.find('.' + this.m.group);
            if ($li) {
                $groups.each(function() {
                    var $jq = $(this);
                    var gid = $jq.attr('id');
                    if ($li.hasClass(gid)) {
                        $grp = $jq;
                        return false;
                    }
                });
                return $grp;
            } else {
                return $groups;
            }
        },

        /**
         * @description select matched options
         * @param {jQuery} $jq
         * @param {Boolean} select FALSE to deselect
         * @param {Boolean} triggerEvent FALSE to disable trigger
         * @param {Boolean} triggerChange FALSE to disable trigger
         * @returns {Object} this
         * @private
         */
        _selectMatchedOptions: function(
            $jq, select, triggerEvent, triggerChange
        ) {

            this._debug('_selectMatchedOptions');

            // trigger 'opOptionChange'
            var trigger = triggerChange === false ? false : true;

            if (trigger && !this._triggerEvent('onOptionChange')) return this;

            var self = this;
            $jq.each(function() {
                var $ob = $(this);
                if (select === false) {
                    self._deselectOption($ob, triggerEvent);
                } else {
                    self._selectOption($ob, triggerEvent);
                }
            });

            if (trigger) this._triggerEvent('onOptionChanged');

            return this;
        },

        /**
         * @description just mark selected/deselected, no logic verified
         * @param {jQuery} $jq
         * @param {Boolean} triggerChange
         * @param {Boolean} select
         * @returns {Object} this
         * @private
         */
        _quickSelectOptions: function($jq, triggerChange, select) {

            this._debug('_quickSelectOptions');

            var trigger = triggerChange === false ? false : true;
            if (trigger && !this._triggerEvent('onOptionChange')) return this;
            if (select === false) {
                $jq.removeClass(this.m.active);
            } else {
                $jq.addClass(this.m.active);
            }
            if (trigger) this._triggerEvent('onOptionChanged');

            return this;
        },

        /**
         * @description update button label with alias name if matches
         * @returns {Boolean}
         * @private
         */
        _matchAliasName: function() {

            this._debug('_matchAliasName');

            if (this.o.showSelectedInLabel) {
                var v = this.getSelectedPairs().value;
                var a = this.o.aliases;
                if (v.length) {
                    for (var n in a) {
                        this._toString(a[n]);
                        if (a.hasOwnProperty(n) &&
                            this._arrayEqual(v, a[n])
                        ){
                            this.$select
                                .find('.' + this.m.label)
                                .html(n);
                            break;
                        }
                    }
                }
            }

            return true;
        },

        /**
         * @description add current selections as one alias
         * @param {String} name
         * @returns {undefined}
         * @private
         * @TODO
         */
        _addAliasLine: function(name) {
            if (this.$buttonAlias) {

                this._debug('_addAliasLine');

                var self = this;
                var $ul  = this.$buttonAlias.find('ul');
                var $li  = $(this.t.alias).appendTo($ul);

                $li.find('.' + this.m.label).addClass(this.s.alias).text(name);
                $li.find('.' + this.m.icon).addClass(this.s.aliasIcon);

                // disable DELETE alias if disableUserAlias is true
                if (!self.o.disableUserAlias) {
                    $li.find('.' + this.m.caret).addClass(this.s.aliasCaret);
                }

                $ul.find('.' + this.m.alias).off()
                    .on ( // click on alias
                        this.e.click,
                        '.' + this.m.label,
                        function(e) {
                            var n = $(e.target).closest('.' + self.m.alias)
                                    .find('.' + self.m.label).text();

                            // set value
                            if (self.o.aliases[n].length > 30 && self.o.optimized) {
                                self._quickSelectValues(self.o.aliases[n]);
                            } else {
                                self.selectOptions(self.o.aliases[n]);
                            }

                            // stop bubbling
                            e.stopPropagation();
                            e.preventDefault();

                            // close alias button self
                            self.$buttonAlias.removeClass(self.m.open);

                            // view status
                            if (self.o.viewAfterAlias &&
                                self.$buttonView) {
                                self.$buttonView.trigger('click');
                            }

                            // dropdrown status
                            if (self.o.closeAfterAlias) {
                                self.$select.trigger('click');
                            }
                        }
                    )
                    .on( // delete alias
                        this.e.click,
                        '.' + this.m.caret,
                        function(e) {
                            var n = $(e.target).closest('.' + self.m.alias)
                                    .find('.' + self.m.label).text();
                            self.removeAlias(n);
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    );
            }
        },

        /**
         * @description update all the folder icons inside dropdown
         * @returns {Object} this
         * @private
         * @TODO
         */
        _updateIcons: function() {

            this._debug('_updateIcons');

            // update visible folder icons
            this.$dropdown.find('.' + this.m.folder).filter(':visible')
                .each($.proxy(function(i, element) {
                    var $jq = $(element);
                    var $li = $jq.closest('li');
                    var id  = $li.attr('id');
                    var lev = parseInt($li.attr(this.a.dataLevel)) + 1;
                    var $sub= this.$dropdown
                        .find('.' + id + '.' + this.a.dataLevel + '-' + lev);
                    if ($sub.filter(':hidden').length) {
                        $li.removeClass(this.m.open);
                    } else if ($sub.length) {
                        $li.addClass(this.m.open);
                    } else {
                        $li.find('.' + this.m.folder).remove();
                    }
                }, this));

            // update toolbar folder icon
            if (this.$buttonUnfold) {
                if (this.$dropdown.find('.' + this.m.option)
                    .not('.' + this.m.disabled).filter(':hidden').length) {
                    this.$buttonUnfold.find('.' + this.m.icon)
                        .removeClass(this.s.buttonFoldOpen)
                        .addClass(this.s.buttonUnfold);
                } else {
                    this.$buttonUnfold.find('.' + this.m.icon)
                        .removeClass(this.s.buttonUnfold)
                        .addClass(this.s.buttonFoldOpen);
                }
            }

            return this;
        },

        /**
         * @description extract data from the original <SELECT>
         * @param {Array} data
         * @param {jQuery} $element
         * @returns {Array}
         * @private
         */
        _extractSelectData: function(data, $element) {

            var a = this.a;
            var self  = this;

            // extract <SELECT>
            if ($element === undefined) {
                this._debug('_extractSelectData');

                // atLeast
                var atLeast = this.$element.attr(a.dataAtLeast);
                if (atLeast !== undefined) {
                    this.o.atLeast = parseInt(atLeast);
                }

                // atMost
                var atMost = this.$element.attr(a.dataAtMost);
                if (atMost !== undefined) {
                    this.o.atMost = parseInt(atMost);
                }

                // is this <SELECT> disabled initially ?
                // added 1.0.21
                if (this.$element.attr('disabled') !== undefined) {
                    this.o.disabled = true;
                }
            }

            // extract <OPTION>, <OPTGROUP>
            ($element ? $element : this.$element)
                .children()
                .each(function(i, node){
                    var $node = $(node), row = {};
                    if (node.nodeName === 'OPTION') {

                        // it is a divider
                        if ($node.attr(a.dataDivider) !== undefined) {
                            row[a.dataDivider] = true;
                            data[data.length] = row;
                            return true;
                        }

                        // it is empty option
                        if ($node.val().trim() === '' && $node.text().trim() === ''){
                          return true;
                        }

                        // normal option
                        row.value    = $node.val();
                        row.label    = $node.text();
                        row.ingroup  = $element !== undefined;

                        // added 1.0.21
                        // parse disable attr in orig <SELECT>
                        if ($node.attr('disabled') !== undefined) {
                            row.disabled = true;
                        }
                        if ($node.attr('selected') !== undefined) {
                            var len = self.o.initialValues.length;
                            if (!self._isMultiple && len) {
                                // single select
                                // ignore selected if initialValues set already
                            } else {
                                self.o.initialValues[len] = row.value;
                            }
                        }

                        // level default to 1
                        row.level    = parseInt($node.attr(a.dataLevel) ?
                            $node.attr(a.dataLevel) : 1);

                        // data-view
                        var view = $node.attr(a.dataView);
                        if (view !== undefined) {
                            row[a.dataView] = row.level + (view.length ? parseInt(view) : 1);
                        }

                        // data-must
                        if ($node.attr(a.dataMust) !== undefined) {
                            row[a.dataMust] = true;
                        }

                        // data-inclusive
                        var inc = $node.attr(a.dataInclusive);
                        if (inc !== undefined) row[a.dataInclusive] = inc.length ? inc : '_';

                        // data-not-selectable
                        if ($node.attr(a.dataNotSelectable) !== undefined){
                          row.notSelectable = $node.data('notSelectable');
                        }

                        data[data.length] = row;
                    } else {
                        row.group = true;
                        row.label = $node.attr('label');

                        // data-group-exclusive
                        var exc = $node.attr(a.dataGroupExclusive);
                        if (exc !== undefined) {
                            row[a.dataGroupExclusive] = exc.length ? exc : '_';
                        }

                        // data-exclusive
                        if ($node.attr(a.dataExclusive) !== undefined || !self._isMultiple) {
                            row[a.dataExclusive] = true;
                        }

                        // data-level-inclusive
                        if ($node.attr(a.dataLevelInclusive) !== undefined) {
                            row[a.dataLevelInclusive] = true;
                        }

                        // data-atleast
                        if ($node.attr(a.dataAtLeast) !== undefined) {
                            if (row[a.dataGroupExclusive]) {
                                this.o.alert(self.o.text.groupExcludeError);
                            } else {
                                var l = $node.attr(a.dataAtLeast);
                                row[a.dataAtLeast] = l.length ? parseInt(l) : 1;
                            }
                        }

                        // data-atmost
                        if ($node.attr(a.dataAtMost) !== undefined) {
                            row[a.dataAtMost] = parseInt($node.attr(a.dataAtMost));
                        }

                        // data-view
                        var view = $node.attr(a.dataView);
                        if (view !== undefined) {
                            row[a.dataView] = view.length ? parseInt(view) : 1;
                        }

                        data[data.length] = row;
                        self._extractSelectData(data, $node);
                    }
                });
        },

        /**
         * @description build the plugin html
         * @param {Array} data
         * @returns {Object} this
         * @private
         */
        _buildPlugin: function(data) {

            this._debug('_buildPlugin');

            this._buildContainer()
                ._buildSelect()
                ._buildDropdown()
                ._buildOption(data);

            // delayed init ?
            if (this.o.delayedInit) {
                this._delayed = false;
            } else {
                this._delayedInit();
            }

            return this;
        },

        /**
         * @description build the plugin container
         * @returns {Object} this
         * @private
         */
        _buildContainer: function() {
            this._debug('_buildContainer');

            this.$container = $(this.t.container)
                .addClass(this.m.container + ' ' + this.s.container)
                .insertAfter(this.$element)
                .data(fullName, this.element);

            return this;
        },

        /**
         * @description build select button
         * @returns {Object} this
         * @private
         */
        _buildSelect: function() {

            this._debug('_buildSelect');

            this.$select = $(this.t.select)
                .addClass(this.s.select)
                .appendTo(this.$container);

            this.$select.find('.' + this.m.icon)
                .addClass(this.s.selectIcon);

            this.$select.find('.' + this.m.label)
                .addClass(this.s.selectLabel)
                .html(this.x.selectLabel);

            this.$select.find('.' + this.m.caret)
                .addClass(this.s.selectCaret);

            return this;
        },

        /**
         * @description build the dropdown
         * @returns {Object} this
         * @private
         */
        _buildDropdown: function() {

            this._debug('_buildDropdown');

            // prepare unique id
            this._theId = this._uniqueId();

            this.$dropdown  = $(this.t.dropdown)
                .addClass(this.s.dropdown)
                .appendTo(this.$container)
                .attr('id', this._theId);

            // dropdown toggle
            this.$select.off().not('.' + this.m.disabled)
                .on(
                    this.e.click,
                    $.proxy(function(e) {
                        this.toggleDropdown();
                    }, this)
                );

            return this;
        },

        /**
         * @description build the toolbar
         * @returns {Object} this
         * @private
         */
        _buildToolbar: function() {

            this._debug('_buildToolbar');

            var t = this.o.toolbar;
            if (t) {
                // toolbar
                this.$toolbar = $(this.t.toolbar)
                        .addClass(this.m.toolbar)
                        .addClass(this.s.toolbarPos)
                        .prependTo(this.$dropdown)
                        .children()
                        .addClass(this.s.toolbar);

                // add buttons
                for (var btn in t) {
                    if (t.hasOwnProperty(btn) && t[btn] && this['_' + btn]) {
                        this['_' + btn]();
                    }
                }
            }
            return this;
        },

        /**
         * @description create a new button
         * @param {ClassString} iconClass
         * @param {Boolean} toggle is it a dropdown button
         * @returns {jQuery}
         * @private
         */
        _buildToolbtn: function(iconClass, toggle) {

            var $btn;
            if (toggle) {
                $btn = $(this.t.buttonToggle).addClass(this.s.buttonToggle);
            } else {
                $btn = $(this.t.button).addClass(this.s.button)
                        .addClass(this.m.button);
            }

            $btn.children('.' + this.m.icon).addClass(iconClass);

            if (toggle) {
                $btn.children('.' + this.m.caret).addClass(this.s.buttonCaret);
            }

            return $btn;
        },

        /**
         * @description add buttonView to toolbar
         * @private
         */
        _buttonView: function() {

            this._debug('_buttonView');

            var v = typeof this.o.toolbar.buttonView === 'string' ?
                this.o.toolbar.buttonView : 'root+selected';

            this.$buttonView = this._buildToolbtn(this.s.buttonView)
                .attr('title', this.x.buttonView)
                .appendTo(this.$toolbar)
                .on(this.e.buttonClick,
                    $.proxy(function() {
                        this._setDefaultView(v);
                        this._updateIcons();
                    }, this)
                );
        },

        /**
         * @description add buttonUnfold to toolbar
         * @private
         */
        _buttonUnfold: function() {

            this._debug('_buttonUnfold');

            this.$buttonUnfold = this._buildToolbtn(this.s.buttonUnfold)
                .attr('title', this.x.buttonUnfold)
                .appendTo(this.$toolbar)
                .on(
                    this.e.buttonClick,
                    $.proxy(function() {
                        if (this.o.enableCollapseAll &&
                            this.$buttonUnfold.find('.' + this.m.icon)
                            .hasClass(this.m.expandAll)
                        ) {
                            // collapse all except for opt-group
                            this._expandAllLevels(true);
                        } else {
                            // expand all
                            this._expandAllLevels();
                        }
                        // update icon
                        this._updateIcons();
                    }, this)
                );
        },

        /**
         * @description add buttonCheckAll to toolbar
         * @private
         */
        _buttonCheckAll: function() {

            this._debug('_buttonCheckAll');

            // only isMultiple
            if (this._isMultiple) {
                this.$buttonCheckAll = this._buildToolbtn(this.s.buttonCheckAll)
                    .attr('title', this.x.buttonCheckAll)
                    .appendTo(this.$toolbar)
                    .on(
                        this.e.buttonClick,
                        $.proxy(function() {

                            // check all
                            this.selectAllOptions();

                            // view selected only
                            if (this.o.viewAfterCheckAll &&
                                this.$buttonView
                            ) {
                                // trigger view
                                this.$buttonView.trigger('click');
                            } else {
                                // update icon
                                this._updateIcons();
                            }
                        }, this)
                     );
            }
        },

        /**
         * @description add buttonUnCheck to toolbar
         * @private
         */
        _buttonUnCheck: function() {

            this._debug('_buttonUnCheck');

            // only isMultiple
            if (this._isMultiple) {
                this.$buttonUnCheck = this._buildToolbtn(this.s.buttonUnCheck)
                    .attr('title', this.x.buttonUnCheck)
                    .appendTo(this.$toolbar)
                    .on(
                        this.e.buttonClick,
                        $.proxy(function() {

                            // uncheck
                            this.deselectAllOptions(
                                this.o.forceUnCheckTriggerEvent
                            );

                            // view selected only
                            if (this.o.viewAfterCheckAll &&
                                this.$buttonView
                            ) {
                                // get default view
                                this._setDefaultView(this.o.defaultView);
                            }
                            this._updateIcons();
                        }, this)
                     );
            }
        },

        /**
         * @description add buttonCancel to toolbar
         * @private
         */
        _buttonCancel: function() {

            this._debug('_buttonCancel');

            this.$buttonCancel = this._buildToolbtn(this.s.buttonCancel)
                .attr('title', this.x.buttonCancel)
                .appendTo(this.$toolbar)
                .on(
                    this.e.buttonClick,
                    $.proxy(function() {

                        // reset to old values
                        if (this._isChanged()) {
                            this.selectOptions(this.$buttonCancel.data('cancel'));
                        }

                        // view selected only
                        if (this.o.viewAfterCancel &&
                            this.$buttonView) {

                            // trigger view
                            this.$buttonView.trigger('click');
                        } else {

                            // update icon
                            this._updateIcons();
                        }

                    }, this)
                 );
        },

        /**
         * @description add buttonAlias to toolbar
         * @private
         */
        _buttonAlias: function() {

            this._debug('_buttonAlias');

            var self = this;

            // <div> container
            this.$buttonAlias = $(this.t.buttonGroup)
                .addClass(this.s.buttonGroup + ' ' + this.m.button)
                .attr('title', this.x.buttonAlias)
                .appendTo(this.$toolbar)
                .append(this._buildToolbtn(this.s.buttonAlias, true))
                .on(
                    this.e.buttonClick,
                    'button',
                    function() {
                        if (!self.$buttonAlias.hasClass(self.m.open)) {
                            self.$buttonAlias.addClass(self.m.open);
                            // hide input box if disableUserAlias
                            if (self.o.disableUserAlias) {
                                self.$save.hide();
                            // focus input box
                            } else {
                                self.$save.focus();
                            }
                        } else {
                            self.$buttonAlias.removeClass(self.m.open);
                        }
                    }
                );

            // add dropdown UL
            var $dropdown = $(this.t.dropdown).addClass(this.s.buttonDropdown);
            this.$buttonAlias.append($dropdown);

            // input box
            var $input = $(this.t.liInput)
                    .addClass(this.s.liInput)
                    .appendTo($dropdown);

            // config input
            this.$save = $input.find('input')
                .addClass(this.s.inputBox)
                .attr('placeholder', this.x.aliasPlaceholder)
                .on('keydown', function(e) {
                    // RETURN entered
                    if (e.which === 13 && self.$save.val() !== '') {
                        var vals = self.getSelectedPairs().value;
                        if (vals.length) {
                            self.addAlias(
                                self.$save.val(),
                                self.getSelectedPairs().value
                            );
                            self.$save.val('');
                            self.$buttonAlias.removeClass(self.m.open);
                        } else {
                            self.o.alert(self.x.emptyValuesError);
                        }
                    }
                });

            // add aliases
            for (var n in this.o.aliases) {
                this._addAliasLine(n);
            }
        },

        /**
         * @description add buttonSearch to toolbar
         * @private
         */
        _buttonSearch: function() {

            this._debug('buttonSearch');

            var self = this;

            // <div> container
            this.$buttonSearch = $(this.t.buttonGroup)
                .addClass(this.s.buttonGroup + ' ' + this.s.dropup +
                    ' ' + this.m.button)
                .attr('title', this.x.buttonSearch)
                .appendTo(this.$toolbar)
                .append(this._buildToolbtn(this.s.buttonSearch, true))
                .on(
                    this.e.buttonClick,
                    'button',
                    function(e) {
                        self.$buttonSearch.toggleClass(self.m.open)
                            .siblings().removeClass(self.m.open);
                        self.$buttonSearch.find('input').focus();
                    }
                );

            // add dropdown
            var $dropdown = $(this.t.dropdown).addClass(this.s.buttonDropdown);
            this.$buttonSearch.append($dropdown);

            // input box
            var $input = $(this.t.liInput)
                    .addClass(this.s.liInput)
                    .appendTo($dropdown);

            // config input box
            var self = this;
            $input.find('input').addClass(this.s.inputBox)
                .attr('placeholder', this.x.searchPlaceholder)
                .on('focus keyup', function(e) {
                    // ignore RETURN
                    if (e.which === 13) return false;

                    var str = $(this).val();

                    if (self.o.searchTimeout) {
                        clearTimeout(self.o.searchTimeout);
                    }
                    self.o.searchTimeout = setTimeout(function () {
                        // start search
                        self._searchOptions(str);
                        // update icons
                        self._updateIcons();
                    }, 250);
                });
        },

        /**
         * @description build options to this.$dropdown
         * @param {Array} data
         * @returns {Object} this
         * @private
         */
        _buildOption: function(data) {

            this._debug('_buildOption');

            // option value/id mapping stored in this.$dropdown
            var mapping = {};

            var html = '', gid = '', oid = '';
            var uids = [ '' ];

            var len = data.length;
            for (var i = 0; i < len; ++i) {

                var row  = data[i];

                // optgroup
                if (row.group) {
                    gid   = this._getOid();
                    html += this._buildOptGroupHtml(row, gid);
                    uids  = [ gid ];

                    // atleast option in this group
                    if (row[this.a.dataAtLeast]) this._oneInGroup = true;

                // divider
                } else if (row[this.a.dataDivider]) {
                    html += this._buildDividerHtml();

                // option
                } else {
                    oid   = this._getOid();

                    mapping[row.value] = oid;

                    // fix row.level
                    if (row.level === undefined) row.level = 1;

                    // fix not selectable
                    if (row.notSelectable === undefined) row.notSelectable = false;

                    var next = data[i+1];
                    if (next && next.level && next.level > row.level) row.children = true;

                    uids[parseInt(row.level)] = oid;

                    html += this._buildOptionHtml(row, oid, uids);
                }
            }

            this.$dropdown.empty().data('mapping', mapping).append(html);

            return this;
        },

        /**
         * @description bypass logic verification, quick set lots of values
         * @param {Array} values
         * @param {Boolean} clear
         * @returns {Object} this
         * @private
         */
        _quickSelectValues: function(values, clear) {

            this._debug('_quickSelectValues');

            if (this._triggerEvent('onOptionChange')) {

                // uncheck everything
                if (clear !== false) this._clearValues();

                var data = this.$dropdown.data('mapping');
                var val;
                for (var i in values) {
                    val = values[i];
                    if (data[val]) $('#' + data[val]).addClass(this.m.active);
                }

                // fix logic for possible missings
                if (clear !== false) this._fixEmptyLogic();

                this._triggerEvent('onOptionChanged');
            }

            return this;
        },

        /**
         * @description compare to the last saved values for cancelling
         * @returns {Boolean}
         * @private
         */
        _isChanged: function() {

            this._debug('_isChanged');

            if (this.$buttonCancel) {
                var old = this.$buttonCancel.data('cancel');
                var val = this.getSelectedPairs().value;
                if (this._arrayEqual(old, val)) return false;
            }

            return true;
        },

        /**
         * @description auto generate option id
         * @private
         */
        _getOid: function() {
            if (this._ocnt === undefined) this._ocnt = 0;
            return this._theId + '-opt' + ++this._ocnt;
        },

        /**
         * @description build divider html
         * @returns {HTMLString}
         * @private
         */
        _buildDividerHtml: function() {
            return this.t.divider;
        },

        /**
         * @descriptioin build optgroup html
         * @param {Object} row
         * @param {IDString} gid
         * @returns {HTMLString}
         * @private
         * @TODO
         */
        _buildOptGroupHtml: function(row, gid) {
            var html =
                // id
                '<li id="' + gid +
                // optgroup marker
                '" class="' + this.m.group + ' ' + this.m.hide + ' ' +
                // data-exclusive
                (row[this.a.dataExclusive] ? this.a.dataExclusive + ' ' : '') +
                // data-level-inclusive class
                (row[this.a.dataLevelInclusive] ? this.a.dataLevelInclusive + ' ' : '') +
                // data-view
                (row[this.a.dataView] ? this.a.dataView + ' ' : '') +
                // end of classes
                '" ' +
                // data-level attribute
                this.a.dataLevel + '="0" ' +
                // data-atmost attribute
                (row[this.a.dataAtMost] ? this.a.dataAtMost + '="' + row[this.a.dataAtMost] + '" ' : '') +
                // data-atleast attribute
                (row[this.a.dataAtLeast] ? this.a.dataAtLeast + '="' + row[this.a.dataAtLeast] + '" ' : '') +
                // data-view attribute
                (row[this.a.dataView] ? this.a.dataView + '="' + row[this.a.dataView] + '" ' : '') +
                // data-group-exclusive attribute
                (row[this.a.dataGroupExclusive] ?
                    this.a.dataGroupExclusive + '="' + row[this.a.dataGroupExclusive] + '" ' : ''
                ) +
                // li label
                '><a><span class="'+ this.m.label +'">' + row.label + '</span>' +
                // folder
                this.t.folder + '</a></li>';

            return html;
        },

        /**
         * @description build optgroup html
         * @param {Object} row
         * @param {IDString} oid
         * @param {Array} uids
         * @returns {HTMLString}
         * @private
         * @TODO
         */
        _buildOptionHtml: function(row, oid, uids) {

            this._debug('_buildOptionHtml');

            // guess in group or not
            if (row.ingroup === undefined) {
                if (uids[0] !== undefined && uids[0] !== '') {
                    row.ingroup = true;
                } else {
                    row.ingroup = false;
                }
            }

            // all upper level ids
            var myuids = [];
            for(var i = row.ingroup === false ? 1 : 0; i < row.level; i++) {
                myuids[i] = uids[i];
            }

            var html =
                // id
                '<li id="' + oid + '" ' +
                // classes
                'class="' + this.m.option +  (row.notSelectable ? ' '+this.m.optionNotSelectable : '') +' ' +
                // in group ?
                (row.ingroup === false ? this.m.noGroup + ' ' : '') +
                // hide
                this.m.hide + ' ' + (row.ingroup === false ? '' : this.m.hide + '-' + row.level + ' ') +
                // upper level ids as class name
                myuids.join(' ') + ' ' +
                // data-view class
                (row[this.a.dataView] ? this.a.dataView + ' ' : '') +
                // data-must class
                (row[this.a.dataMust] ? this.a.dataMust + ' ' : '') +
                // data-input marker
                (row[this.a.dataSpecial] ? this.a.dataSpecial + ' ' : '') +
                // added 1.0.21 for initially disabled option
                (row.disabled === true ? this.m.disabled + ' ' : '') +
                // data-level class
                this.a.dataLevel + '-' + row.level +
                // end of classes
                '" ' +
                // data-upper attribute
                (row.level > 1 ? this.a.dataUpper + '="' + myuids[row.level - 1] + '" ' : '') +
                // data-inclusive attribute
                (row[this.a.dataInclusive] ?
                    this.a.dataInclusive + '="' + row[this.a.dataInclusive] + '" ' : '') +
                // data-view attribute
                (row[this.a.dataView] ? this.a.dataView + '="' + row[this.a.dataView] + '" ' : '') +
                // data-value attribute
                this.a.dataValue + '="' + row.value + '" ' +
                // data-level attribute
                this.a.dataLevel + '="' + row.level + '" ' +
                // checker icon
                '><a>'+
                (row.notSelectable ? '' : '<i class="' + this.m.checker + ' ' + this.s.checker + '"></i><i class="' + this.m.checkerNo + ' ' + this.s.checkerNo + '"></i>')+

                // label or row.html
                (row.html ? row.html : ('<span class="' + this.m.label +'">' + row.label + '</span>')) +
                // folder
                (row.children ? this.t.folder : '')
                // end option
                + '</a></li>';

            return html;
        },

        /**
         * @description close opened dropdowns in toolbar
         * @private
         */
        _closeToolbar: function() {
            if (this.$toolbar) {
                this._debug('_closeToolbar');
                this.$toolbar.removeClass(this.m.open)
                    .find('.' + this.m.open)
                    .removeClass(this.m.open);
            }
        },

        /**
         * @description bind most of the events
         * @returns {Object} this
         * @private
         */
        _bindEvents: function() {

            this._debug('_bindEvents');

            var self = this;
            var m    = this.m;

            // click inside dropdown
            this.$dropdown.off()
                .on( // click outside toolbar
                    this.e.click,
                    function() {
                        self._closeToolbar();
                    }
                )
                .on( // stop bubble out of toolbar
                    this.e.click,
                    '.' + m.toolbar,
                    function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }
                )
                .on( // click on the toolbar button
                    this.e.click,
                    '.' + m.button,
                    function(e) {
                        $(e.target)
                            .closest('.' + self.m.button)
                            .siblings()
                            .removeClass(m.open);
                    }
                )
                .on( // click on folder icon
                    this.e.click,
                    '.' + m.folder,
                    function(e) {
                        self._toggleFolder($(e.target).closest('li'));
                        self._closeToolbar();
                        self._updateIcons();
                        return false;
                    }
                )
                .on( // click on group
                    this.e.click,
                    '.' + m.group,
                    function(e) {
                        if (self.o.clickGroupOpen) {
                            self._toggleFolder($(e.target).closest('.' + m.group));
                            self._updateIcons();
                        }
                    }
                )
                .on( // click on option
                    this.e.click,
                    '.' + m.option + ':not(.'+m.optionNotSelectable+')',
                    function(e) {
                        var $p = $(e.target).parentsUntil('.' + m.option).andSelf();
                        // stop bubbling
                        if ($p.filter('.' + m.noBubble).length) {

                        } else {
                            self.toggleOption($(this));
                        }
                    }
                );

            // click out of $container will trigger close dropdowns
            if (this.o.closeOnClickOutside) {
                $(document).on(
                    this.e.click,
                    function(e) {
                        if ($(e.target).parents('.' + self.m.container).length === 0) {
                            $('.' + self.m.container)
                                .filter('.' + self.m.open)
                                .each(function() {
                                    var elem = $(this).data(fullName);
                                    $(elem).data(fullName).closeDropdown();
                                });
                        }
                    }
                );
            }

            return this;
        },

        /**
         * @description expand or collapse all levels
         * @param {Boolean} forceCollapse TRUE to force collpase
         * @param {Boolean} viewGroup FALSE to hide groups
         * @private
         */
        _expandAllLevels: function(forceCollapse, viewGroup) {

            this._debug('_expandAllLevels');

            var self = this;

            // collapse
            if (forceCollapse) {
                this.$dropdown
                    .find('.' + this.m.option)
                    .each(function(i, element) {
                        var $li = $(element);
                        $li.addClass(self.m.hide + '-' + $li.attr(self.a.dataLevel));
                });

                if (viewGroup === false) {
                    this.$dropdown.find('.' + this.m.group)
                        .addClass(self.m.hide + '-0');
                } else {
                    this.$dropdown.find('.' + this.m.group)
                        .removeClass(self.m.hide + '-0');
                }

            // open
            } else {
                this.$dropdown.find('.' + this.m.option)
                    .removeClass(this._allHideClasses);
                this.$dropdown.find('.' + this.m.group)
                    .removeClass(this.m.hide + '-0');
            }
        },

        /**
         * @description get upper levels and fireup callback
         * @param {jQuery} $li
         * @param {Callback} callback
         * @param {Boolean} andSelf FALSE to not include $li self
         * @returns {jQuery}
         * @private
         */
        _getUpperLevels: function($li, callback, andSelf) {

            this._debug('_getUpperLevels');

            var level = parseInt($li.attr(this.a.dataLevel));
            if (andSelf !== false) callback($li);
            if (level > 1) {
                var $up = $('#' + $li.attr(this.a.dataUpper));
                if (andSelf === false) callback($up);
                this._getUpperLevels($up, callback);
            }
        },

        /**
         * @description get value of an option
         * @param {jQuery} $li
         * @returns {String}
         * @private
         */
        _getOptionValue: function($li) {
            this._debug('_getOptionValue');

            return $li.hasClass(this.a.dataSpecial) ?
                this.o.getSpecialValue($li, this) :
                $li.attr(this.a.dataValue);
        },

        /**
         * @description get label of an option
         * @param {jQuery} $li
         * @returns {String}
         * @private
         */
        _getOptionLabel: function($li) {
            this._debug('_getOptionLabel');

            return $li.hasClass(this.a.dataSpecial) ?
                this.o.getSpecialLabel($li, this) :
                $li.children('a').text();
        },

        /**
         * @description get all selected options
         * @param {Boolean} skipDisabled FALSE to include disabled options
         * @returns {jQuery}
         * @private
         */
        _getSelectedOptions: function(skipDisabled) {

            this._debug('_getSelectedOptions');

            var $res = this.$dropdown.find('.' + this.m.active + '.' + this.m.option);

            if (skipDisabled === false) {
                return $res;
            } else {
                return $res.not('.' + this.m.disabled);
            }
        },

        /**
         * @description select options base on values, no sync to <SELECT>
         * @param {Array} values
         * @returns {Object} this
         * @private
         */
        _setValues: function(values) {

            this._debug('_setValues');

            this._toString(values);

            for (var i in values) {
                if (!this._selectOption(values[i])) {
                    this.o.alert(this.x.valueSetError + values[i]);
                };
            }
            return this;
        },

        /**
         * @description deselect options base on values, no sync to <SELECT>
         * @param {Array} values
         * @returns {Object} this
         * @private
         */
        _unSetValues: function(values) {

            this._debug('_unSetValues');

            this._toString(values);

            for (var i in values) {
                if (!this._deselectOption(values[i])) {
                    this.o.alert(this.x.valueSetError + values[i]);
                };
            }
            return this;
        },

        /**
         * @description deselect everthing, without logic verification
         * @returns {Object} this
         * @private
         */
        _clearValues: function() {

            this._debug('_clearValues');

            this.$dropdown
                .find('.' + this.m.active + '.' + this.m.option)
                .not('.' + this.m.disabled)
                .removeClass(this.m.active);

            return this;
        },

        /**
         * @description the search options from 'str'
         * @param {String} str
         * @returns {jQuery}
         * @private
         */
        _searchOptions: function(str) {

            this._debug('_searchOptions');

            var self = this;

            // trim
            str = str.replace(/(^\s*)|(\s*$)/g, '');

            if (str === '') {

                // expand all
                this._expandAllLevels();

            } else {

                // collapse all (including root)
                this._expandAllLevels(true, false);

                // show only matched
                this.$dropdown
                    .find('.' + this.m.option)
                    .not('.' + this.m.disabled)
                    .each(function() {
                        var $opt   = $(this);

                        // get value & label
                        var value = self._getOptionValue($opt);
                        var label = self._getOptionLabel($opt);

                        // construct 'toSrch'
                        var toSrch = label;
                        if (self.o.searchBy === 'value') {
                            toSrch = value;
                        } else if (self.o.searchBy === 'both') {
                            toSrch = label + ' ' + value;
                        }
                        if (self.o.searchCaseInsensitive) {
                            str = str.toLowerCase();
                            toSrch = toSrch.toLowerCase();
                        }

                        // match found
                        if (toSrch.indexOf(str) > -1) {
                            self._getUpperLevels($opt, function($x) {
                                $x.removeClass(self._allHideClasses);
                            });
                            self._getGroup($opt).removeClass(self.m.hide + '-0');
                        }
                    });
                this._updateIcons();
            }
        },

        /**
         * @description generate an unique id for this.$dropdown
         * @returns {String}
         * @private
         */
        _uniqueId: function() {
            this._debug('_uniqueId');
            return 's' + (Math.random() + 1).toString(36).slice(-5);
        },

        /**
         * @description check exists of multiple classes in $jq
         * @param {jQuery} $jq
         * @param {ClassString} c multiple class names string
         * @returns {Boolean}
         * @private
         */
        _hasClasses: function($jq, c) {

            this._debug('_hasClasses');

            var a = c.split(' ');
            for(var i = 0, l = a.length; i < l; i++){
                if(!$jq.hasClass(a[i])) return false;
            }
            return true;
        },

        /**
         * @description convert element to string in an array
         * @param {Array} a
         * @private
         */
        _toString: function(a) {
            this._debug('_toString');
            for(var i in a) {
                a[i] = a[i].toString();
            }
        },

        /**
         * @description wether 2 options are peer/sibling
         * @param {jQuery} $one
         * @param {jQuery} $two
         * @returns {Boolean}
         * @private
         */
        _isPeer: function($one, $two) {
            this._debug('_isPeer');
            return $one.attr(this.a.dataUpper) === $two.attr(this.a.dataUpper);
        },

        /**
         * @description compare 2 options in the same group is inclusive or not
         * @param {jQuery} $one
         * @param {jQuery} $two
         * @returns {Boolean}
         * @private
         */
        _isDataInclusive: function($one, $two) {

            this._debug('_isDataInclusive');

            if (this._isPeer($one, $two)) {
                var o = $one.attr(this.a.dataInclusive);
                var t = $two.attr(this.a.dataInclusive);
                return this._charOverlap(o, t);
            }
            return false;
        },

        /**
         * @description figure out two groups exclusive with each other or not
         * @param {jQuery} $one
         * @param {jQuery} $two
         * @returns {Boolean}
         * @private
         */
        _isGroupExclusive: function($one, $two) {

            this._debug('_isGroupExclusive');

            var o = $one ? $one.attr(this.a.dataGroupExclusive) : undefined;
            var t = $two ? $two.attr(this.a.dataGroupExclusive) : undefined;

            return !this._charOverlap(
                    o === undefined ? '.' : o,
                    t === undefined ? '.' : t
            );
        },

        /**
         * @description check $group is multiple or data-exclusive
         * @param {jQuery} $group
         * @returns {Boolean}
         * @private
         */
        _isGroupMultiple: function($group) {

            this._debug('_isGroupMultiple');

            // in group
            if ($group && $group.length) {
                return !$group.hasClass(this.a.dataExclusive);

            // in root
            } else {
                return !(this._isMultiple && this._isDataExclusive);
            }
        },

        /**
         * @description check $group|root is level inclusive or not
         * @param {jQuery} $group
         * @returns {Boolean}
         * @private
         */
        _isLevelInclusive: function($group) {

            this._debug('_isLevelInclusive');

            if ($group && $group.length) {
                return $group.hasClass(this.a.dataLevelInclusive) ||
                       this.o.dataLevelInclusive;
            } else {
                return this.o.dataLevelInclusive;
            }
        },

        /**
         * @description test 2 strings have same chars
         * @example
         *  A = "a b c";
         *  B = "1 2 a";
         *
         * @param {String} A
         * @param {String} B
         * @returns {Boolean}
         * @private
         */
        _charOverlap: function(A, B) {

            this._debug('_charOverlap');

            var a = A ? A.split(' ') : [];
            var b = B ? B.split(' ') : [];
            var match = a.filter(function(n) {
                return b.indexOf(n) !== -1;
            });
            return match.length ? true : false;
        },

        /**
         * @description test 2 arrays have same values (order may different)
         * @param {Array} a
         * @param {Array} b
         * @returns {Boolean}
         * @private
         */
        _arrayEqual: function(a, b) {

            this._debug('_arrayEqual');

            if (a.length !== b.length ||
                a.filter(function(n) {
                    return b.indexOf(n) === -1;
                }).length + b.filter(function(n) {
                    return a.indexOf(n) === -1;
                }).length > 0
            ) return false;
            return true;
        },

        /**
         * @description repeat string
         * @param {String} str
         * @param {Integer} num
         * @returns {String}
         */
        _stringRepeat: function(str, num) {
            var tmp = '';
            for (var i = 0; i < num; i++) tmp += str;
            return tmp;
        },

        /**
         * @description resolve some option issues before plugin load
         * @returns {Boolean}
         * @private
         */
        _fixPluginOptions: function() {

            this._debug('_fixPluginOptions');

            // is plugin attached to a <SELECT> ?
            this._isSelect = this.element.nodeName === 'SELECT';

            // is this a multiple-select ?
            this._isMultiple = this.o.multiple ? true : false;
            if (this._isSelect && this.$element.attr('multiple') === undefined) {
                this._isMultiple = false;
            }

            // is data exclusive in <SELECT> root level ?
            if (this._isSelect &&
                this.$element.attr(this.a.dataExclusive) !== undefined
            ) {
                this._isDataExclusive = true;
            }

            // for single select, closeOnSelect
            if (!this._isMultiple) this.o.closeOnSelect = true;

            // optimized ?
            if (this.o.optimized) {
                this.o.delayedInit = true;
                this.o.keepInSync  = false;
                this.o.debug = 0;
            }

            // if 'defaultValues' is set, then set 'atLeast'
            if (this.o.defaultValues !== null && !this.o.atLeast) {
                this.o.atLeast = 1;
            }

            // simple handlers
            for (var i in this.o.handler) {
                if (this.o.handler.hasOwnProperty(i)) {
                    this.$element.on(i + eventSuffix, this.o.handler[i]);
                }
            }

            // hide-* class
            this._allHideClasses = '';
            for (var i = 1; i <= this.o.maxLevels ; i++) {
                this._allHideClasses += this.m.hide + '-' + i + ' ';
            }

            return true;
        },

        /**
         * @description hide the original <SELECT> element
         * @returns {Boolean}
         * @private
         */
        _hideOriginalSelect: function() {

            this._debug('_hideOriginalSelect');

            if (this._isSelect) this.$element.hide();

            return true;
        },

        /**
         * @description set default values, no verification
         * @private
         */
        _setDefaultValues: function() {

            this._debug('_setDefaultValues');

            this._clearValues();

            // check initial values first
            if (this.o.initialValues.length) {
                this._setValues(this.o.initialValues);
                this.o.initialValues.length = 0;

            // check default values
            } else if (this.o.defaultValues !== null) {
                this._setValues(this.o.defaultValues);
            }

            return true;
        },

        /**
         * added 1.0.21
         *
         * @description initial <SELECT> is disabled or not
         * @private
         */
        _disabledSelect: function() {
            this._debug('_setDefaultValues');
            if (this._isSelect && this.o.disabled === true) {
                this.disableSelect();
            }
        },

        /**
         * @description fix logic when deselect, disable or plugin loaded
         * @param {jQuery} $target
         * @param {EventString} event short event name
         * @returns {Boolean}
         * @private
         */
        _fixEmptyLogic: function($target, event) {

            this._debug('_fixEmptyLogic');

            if (this._mustSelect($target, event) &&
                this._atLeastInGroup($target, event) &&
                this._atLeast($target, event)) {

                return true;
            }

            return false;
        },

        /**
         * @description at least # should be selected in this.$dropdown
         * @param {jQuery} $target
         * @param {String} event
         * @returns {Boolean}
         * @private
         */
        _atLeast: function($target, event) {

            this._debug('_atLeast');

            if (!this.o.atLeast) return true;

            // selected
            var $selected = this._getSelectedOptions();

            var req = this.o.atLeast;

            // onOptionDeselect
            if (event === 'onOptionDeselect') {

                // more than enough checked
                if ($selected.not($target).length + 1 > req) return true;

                // reset to default values
                if (req === 1 && this.o.defaultValues !== null) {
                    this._setValues(this.o.defaultValues);
                    if ($.inArray(this._getOptionValue($target),
                        this.o.defaultValues) === -1) return true;
                }

                // disable this unselect action
                this.$element.trigger('atLeast' + eventSuffix);

                return false;

            // onOptionDisabled
            } else if (event === 'onOptionDisabled') {

                // more than enough checked
                if ($selected.length >= req) return true;

                // reset to default values
                if (req === 1 && this.o.defaultValues !== null) {
                    this._setValues(this.o.defaultValues);
                }

                $selected = this._getSelectedOptions();
                if ($selected.length >= req) return true;

                // select others
                this._selectMatchedOptions(
                    this.$dropdown.find('.' + this.m.option)
                        .not('.' + this.m.disabled)
                        .not('.' + this.m.active)
                        .slice(0, req - $selected.length),
                    true, true, false
                );

                return true;

            // onPluginLoaded & etc.
            } else {

                // selected already
                if ($selected.length >= req) return true;

                // default values
                if (this.o.defaultValues !== null) {
                    this._setValues(this.o.defaultValues);
                    $selected = this._getSelectedOptions();
                }

                // check agin
                if ($selected.length < req) {
                    this._selectMatchedOptions(
                        this.$dropdown.find('.' + this.m.option)
                            .not('.' + this.m.disabled)
                            .not('.' + this.m.active)
                            .slice(0, req - $selected.length),
                        true, true, false
                    );
                }
            }

            return true;
        },

        /**
         * @description must select these values in this.o.mustSelect array
         * @param {jQuery} $target
         * @param {EventString} event short event name
         * @returns {Boolean}
         * @private
         */
        _mustSelect: function($target, event) {

            this._debug('_mustSelect');

            if (this.o.mustSelect.length > 0) {
                var ms = this.o.mustSelect;
                for (var i in ms) {
                    var $x = this._getOptionByValue(ms[i]);
                    $x.addClass(this.a.dataMust);
                }
                this.o.mustSelect.length = 0;
            }

            var $must = this.$dropdown.find('.' + this.a.dataMust)
                .not('.' + this.m.disabled);
            if ($must.length === 0) return true;

            // onOptionDeselect
            if (event === 'onOptionDeselect') {

                // match found, disable this unselect
                if ($must.filter($target).length) {
                    this.$element.trigger('mustSelect' + eventSuffix);
                    return false;
                }

                return true;

            // onPluginLoaded
            } else if (event === 'onPluginLoaded') {
                this._selectMatchedOptions($must, true, true, false);
            }

            return true;
        },

        /**
         * @description at most # of selections should be selected
         * @param {jQuery} $target
         * @param {EventString} event short event name
         * @returns {Boolean}
         * @private
         */
        _atMost: function($target, event) {

            this._debug('_atMost');

            if (!this._isAtMost()) return true;

            var $group = this._getGroup($target);

            // check group
            if ($group.length) {
                if ($group.is('[' + this.a.dataAtMost + ']')) {
                    var most = parseInt($group.attr(this.a.dataAtMost));
                    if (this.$dropdown
                        .find('.' + this.m.active + '.' + $group.attr('id'))
                        .not('.' + this.m.disabled).length === most) {
                        this.$element.trigger('atMost' + eventSuffix);
                        return false;
                    }
                }
            }

            // check overall
            if (!this.o.atMost) return true;

            // selected
            var $selected = this._getSelectedOptions();

            // not enough checked
            if ($selected.length < this.o.atMost) return true;

            // disable this select action
            this.$element.trigger('atMost' + eventSuffix);

            return false;
        },

        /**
         * @description test 'atMost' in root and all the groups
         * @returns {Boolean}
         * @private
         */
        _isAtMost: function() {
            if (this._atmost !== undefined) return this._atmost;

            // root level
            if (this.o.atMost) {
                this._atmost = true;
                return this._atmost;
            }

            // group level
            if (this.$dropdown
                .find('.' + this.m.group)
                .not('.' + this.m.disabled)
                .filter('[' + this.a.dataAtMost + ']').length) {
                this._atmost = true;
                return this._atmost;
            }

            this._atmost = false;

            return this._atmost;
        },

        /**
         * @description make sure at least # selected in the optgroup
         * @param {jQuery} $target
         * @param {EventString} event short event name
         * @returns {Boolean}
         * @private
         */
        _atLeastInGroup: function($target, event) {

            this._debug('_atLeastInGroup');

            // no data-atleast group exists
            if (!this._oneInGroup) return true;

            // onOptionDeselect
            if (event === 'onOptionDeselect') {

                // get the group
                var $group = this._getGroup($target);

                // not group found
                if ($group.length === 0) return true;

                // $group is not a data-atleast group
                if (!$group.is('[' + this.a.dataAtLeast + ']')) return true;

                // more than atleast opts in this group selected
                var least = parseInt($group.attr(this.a.dataAtLeast));
                if (this._getSelectedOptions()
                    .filter('.' + $group.attr('id')).length > least) return true;

                // disable unselect
                this.$element.trigger('atLeast' + eventSuffix);

                return false;

            // onOptionDisabled
            } else if (event === 'onOptionDisabled') {

                // get the group
                var $group = this._getGroup($target);

                // not group found
                if ($group.length === 0) return true;

                // $group is not a data-atleast group
                if (!$group.is('[' + this.a.dataAtLeast + ']')) return true;

                // more than atleast opts in this group selected
                var gid   = $group.attr('id');
                var least = parseInt($group.attr(this.a.dataAtLeast));
                var done  = this._getSelectedOptions().filter('.' + gid).length;
                if (done >= least) return true;

                // select others
                this._selectMatchedOptions(
                    this.$dropdown.find('.' + gid)
                        .not('.' + this.m.disabled)
                        .not('.' + this.m.active)
                        .slice(0, least - done),
                    true, true, false
                );

                return true;

            // onPluginLoaded or etc.
            } else {
                // set the least options in groups
                var self = this;
                this._getGroup().filter('[' + this.a.dataAtLeast + ']')
                    .each(function() {
                        var $grp  = $(this);
                        var least = parseInt($grp.attr(self.a.dataAtLeast));
                        var done  = self._getSelectedOptions()
                                .filter('.' + $grp.attr('id')).length;
                        if (done >= least) return true;

                        self._selectMatchedOptions(
                            self.$dropdown
                                .children('.' + $grp.attr('id'))
                                .not('.' + self.m.disabled)
                                .slice(0, least),
                            true, true, false
                        );
                    });
            }

            return true;
        },

        /**
         * @description on selecting $target, deselect other conflict options
         * @param {jQuery} $target
         * @returns {Boolean}
         * @private
         */
        _fixSelectLogic: function($target) {

            this._debug('_fixSelectLogic');

            // selected options other than the $target
            var $other = this._getSelectedOptions().not($target);

            // no other selected
            if ($other.length === 0) return true;

            var self = this;

            // single selection, unselect others
            if (this._isMultiple === false) {
                $other.each(function() {
                    self._deselectOption(this);
                });
                return true;
            }

            // $target's group, get $() for non-grouped options
            var $group = this._getGroup($target);

            // $target's level
            var level  = parseInt($target.attr(this.a.dataLevel));

            // deal with other groups
            var $grps = this.$dropdown
                    .find('.' + this.m.group)
                    .not('.'  + this.m.disabled)
                    .not($group);

            // uncheck those exclusive groups or root
            var glist = [];
            $grps.each(function() {
                glist[glist.length] = $(this);
            });
            for (var i in glist) {
                var $grp = glist[i];
                if (self._isGroupExclusive($group, $grp)) {
                    self.deselectGroupOptions($grp, false);
                }
            }

            if ($group.length && self._isGroupExclusive($group)) {
                self.deselectGroupOptions(undefined, false);
            }

            // same group or same in root

            // data-exclusive
            if (!this._isGroupMultiple($group)) {
                var $sgOpts = this.$dropdown
                    .find('.' + this.m.active + '.' + this.m.option)
                    .filter('.' + ($group.length ? $group.attr('id') : this.m.noGroup))
                    .not('.' + this.m.disabled).not($target);

                $sgOpts.each(function() {
                    var $li = $(this);
                    if (!self._isDataInclusive($target, $li)) {
                        self._deselectOption($li);
                    }
                });
            }

            // !data-level-inclusive, unselect related
            if (!this._isLevelInclusive($group)) {

                // active descendants
                this.$dropdown
                    .find('.' + $target.attr('id') + '.' + this.m.active)
                    .not('.' + this.m.disabled)
                    .removeClass(this.m.active);

                // peers & ancenstor && differnt branches
                var $sgOpts = this.$dropdown
                    .find('.' + this.m.active + '.' + this.m.option)
                    .filter('.' + ($group.length ? $group.attr('id') : this.m.noGroup))
                    .not('.' + this.m.disabled).not($target);

                if (level > 1 && $sgOpts.length) {
                    var upper = $target.attr(this.a.dataUpper);
                    var $peers = this.$dropdown
                        .find('.' + upper)
                        .filter('.' + this.a.dataLevel + '-' + level)
                        .not('.' + this.m.disabled);

                    var p = $peers.not('.' + this.m.active).length;

                    // only $target in this level has non-active peer
                    if ($peers.length === 1 || p > 0) {

                        // uncheck uppers
                        this._getUpperLevels($target, function($x) {
                            if ($x.hasClass(self.m.active)) {
                                self._deselectOption($x);
                            }
                        }, false);

                    // all checked in same level
                    } else if (p === 0) {

                        // check upper
                        this._selectOption($('#' + upper));
                    }
                }
            }

            return true;
        },

        /**
         * @description set the select button text
         * @param {String} txt
         * @returns {Boolean}
         * @private
         */
        _setSelectLabel: function(txt) {

            if (this.o.showSelectedInLabel) {

                this._debug('_setSelectLabel');

                var longString;
                if (typeof txt === 'string') {
                    var text = txt;
                    longString = txt;
                } else {
                    // default text
                    var text = this.x.selectLabel;
                    longString = text;

                    // selected option text
                    var labels = this.getSelectedPairs().text;
                    if (labels.length) {
                        longString = labels.join(',');
                        if (this.o.showSelectedCallback) {
                            text = this.o.showSelectedCallback.call(this, labels);
                        } else {
                            if (labels.length <= this.o.showSelectedCount) {
                                text = labels.join(this.o.showSelectedSeperator);
                            } else {
                                text = this.x.labelTemplate.replace('#', labels.length);
                            }
                        }
                    }
                }

                // set it
                this.$select
                    .find('.' + this.m.label)
                    .attr('title', longString)
                    .html(text);
            }

            return true;
        },

        /**
         * @description save old selected values if $buttonCancel exists
         * @returns {Boolean}
         * @private
         */
        _saveOldValues: function() {

            this._debug('_saveOldValues');

            if (this.$buttonCancel) {
                this.$buttonCancel.data('cancel', this.getSelectedPairs().value);
            }
            return true;
        },

        /**
         * @description run delayed init
         * @returns {Boolean}
         * @private
         */
        _delayedInit: function() {

            // once only
            if (this._delayed === true) return true;

            this._debug('_delayedInit');

            // add folder icon in this.$dropdown
            this.$dropdown.find('.' + this.m.folder + '.' + this.m.folderOpen)
                .addClass(this.s.folderOpen);
            this.$dropdown.find('.' + this.m.folder + '.' + this.m.folderClose)
                .addClass(this.s.folderClose);

            // add divider class
            this.$dropdown.find('.' + this.m.divider).addClass(this.s.divider);

            // build toolbar & bind events
            this._buildToolbar()._bindEvents();

            // set initial viewing status
            this._setDefaultView();

            // turn off switch
            this._delayed = true;

            return true;
        },

        /**
         * @description set default view
         * @param {String} view
         * @private
         */
        _setDefaultView: function(view) {

            var self  = this;
            var views = (view ? view : this.o.defaultView).split('+');

            // expand all
            if ($.inArray('expand', views) > -1) {
                this._expandAllLevels();
                return true;
            }

            // collapse all first (group showed)
            this._expandAllLevels(true);

            // root level
            if ($.inArray('root', views) > -1) {
                this.$dropdown.find('.' + this.m.noGroup)
                    .removeClass(this._allHideClasses);
            }

            // level1
            if ($.inArray('level1', views) > -1) {
                this.$dropdown.find('.' + this.m.option)
                    .filter('['+ this.a.dataLevel + '=1]')
                    .removeClass(this._allHideClasses);
            }

            // level2
            if ($.inArray('level2', views) > -1) {
                this.$dropdown.find('.' + this.m.option)
                    .filter('['+ this.a.dataLevel + '=1]')
                    .removeClass(this._allHideClasses);
                this.$dropdown.find('.' + this.m.option)
                    .filter('['+ this.a.dataLevel + '=2]')
                    .removeClass(this._allHideClasses);
            }

            // selected
            if ($.inArray('selected', views) > -1) {
                this.$dropdown
                    .find('.' + this.m.active + '.' + this.m.option)
                    .not('.' + this.m.disabled)
                    .each(function(i, li) {
                        var $li  = $(li);
                        self._getUpperLevels($li, function($x) {
                            $x.removeClass(self._allHideClasses);
                        });
                    });
            }

            // honor data-view
            if ($.inArray('view', views) > -1) {
                this.$dropdown
                    .find('.' + this.a.dataView)
                    .not('.' + this.m.disabled)
                    .each(function(i, li) {
                        var $li  = $(li);

                        // show uppers first
                        self._getUpperLevels($li, function($x) {
                            $x.removeClass(self._allHideClasses);
                        });

                        // show lower levels
                        var id = $li.attr('id');
                        var v  = parseInt($li.attr(self.a.dataView));
                        v = v < 4 ? v : 1; // hacking
                        for (var i = 1; i <= v; ++i) {
                            self.$dropdown.find('.' + id + '.' + self.a.dataLevel + '-' + i)
                                .removeClass(self._allHideClasses);
                        }
                    });
            }

            return true;
        },

        /**
         * @description close dropdown on select one option
         * @private
         */
        _closeOnSelect: function() {
            if (this.o.closeOnSelect) {
                this.$select.trigger('click');
            }
        },

        /**
         * @description force sync plugin values with original <SELECT>
         * @returns {Boolean}
         * @private
         */
        _syncSelect: function() {

            if (this._isSelect) {

                this._debug('_syncSelect');

                var old = this.o.keepInSync;
                this.o.keepInSync = true;
                this._flushSelect();
                this.o.keepInSync = old;
            }

            return true;
        },

        /**
         * @description flush(not forced) plugin with original <SELECT>
         * @returns {Boolean}
         * @private
         */
        _flushSelect: function() {

            if (this._isSelect && this.o.keepInSync) {

                this._debug('_flushSelect');

                // new values
                var vals = this.getSelectedPairs().value;

                // empty first
                this.$element.find('option:selected').prop('selected', false);

                if (vals.length) {
                    this.$element.find('option').each(function() {
                        var v = $(this).val();
                        if ($.inArray(v, vals) > -1) {
                            $(this).prop('selected', true);
                        }
                    });
                }
            }

            return true;
        }
    };

    // PLUGIN DEFINITION
    // ====================================================
    /**
     * @param {Object} options
     * @param {Object} extras
     */
    function Plugin(options, extras) {
        return this.each(function () {
            var $this = $(this);

            // destroy
            if (options === 'destroy') {
                $this.data(fullName, false);
                return;
            }

            var data  = $this.data(fullName);

            // init
            if (!data) {
                $this.data(fullName, (data = new SmartSelect(this, options)));
                return;
            }

            // methods
            if (typeof options === 'string') data[options].apply(data, extras);
        });
    };

    var old = $.fn[pluginName];

    $.fn[pluginName] = Plugin;
    $.fn[pluginName].Constructor = SmartSelect;

    // get smartselect object
    $.fn['get' + pluginName] = function() {
        return this.first().data(fullName);
    };

    // NO CONFLICT
    // ====================================================
    $.fn[pluginName].noConflict = function () {
        $.fn[pluginName] = old;
        return this;
    };
})( window.jQuery );
