'use strict';

require('./baseGroup.less');

const $ = require('jquery');
const _ = require('lodash');

const Group = require('../interface/group');

class BaseGroup extends Group {
  constructor(opts) {
    super(opts);
    this.id = opts.id;
    this.top = opts.top;
    this.left = opts.left;
    this.width = opts.width || 300;
    this.height = opts.height || 150;
    this.resize = opts.resize;
    this.dom = null;
    this.nodes = [];
    this.options = opts.options;
    this._on = opts._on;
    this._emit = opts._emit;
    this._container = null;
  }
  init() {
    this.dom = this.draw({
      id: this.id,
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height,
      dom: this.dom,
      options: this.options
    });
    this._addEventLinster();
  }
  draw(obj) {
    let _dom = $(obj.dom);
    if (!_dom) {
      _dom = $('<div></div>')
        .attr('class', 'group')
        .attr('id', obj.id);
    }
    let group = $(_dom);
    
    let titleDom = $('<div></div>')
      .attr('class', 'title');
    
    if (_.get(this, 'options.title')) {
      titleDom.text(_.get(this, 'options.title'));
    }

    group.append(titleDom);

    this._container = $('<div></div>')
      .attr('class', 'container');
    
    group.append(this._container);

    // 默认resize打开
    if (this.resize !== false) {
      this.setResize(true);
    }

    if (obj.top) {
      group.css('top', obj.top + 'px');
    }
    if (obj.left) {
      group.css('left', obj.left + 'px');
    }
    if (obj.width) {
      group.css('width', obj.width + 'px');
    }
    if (obj.height) {
      group.css('height', obj.height + 'px');
    }
    return _dom[0];
  }
  addNodes(nodes = []) {
    nodes.forEach((item) => {
      item._group = this;
      $(this.dom).append(item.dom);
      this.nodes.push(item);
    });
  }
  addNode(node) {
    this.addNodes([node]);
  }
  removeNodes(nodes = []) {
    let rmNodes = [];
    this.nodes.forEach((item) => {
      let _node = _.find(nodes, (_node) => {
        return _node.id === item.id;
      });
      if (_node) {
        rmNodes.push(_node);
        _node.dom.remove();
      }
    });
    return rmNodes;
  }
  removeNode(node) {
    return this.removeNodes([node]);
  }
  setResize(flat, container = this.dom) {
    let mouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._emit('InnerEvents', {
        type: 'group:resize',
        group: this
      });
    };
    if (flat) {
      let icon = $('<span class="group-icon-resize butterfly-icon icon-drag"></span>')
        .appendTo(container);
      icon.on('mousedown', mouseDown);
    }
  }
  setSize(width = this.width, height = this.height) {
    this.width = width;
    this.height = height;
    $(this.dom).css('width', this.width).css('height', this.height);
  }
  remove() {
    this._emit('InnerEvents', {
      type: 'group:delete',
      data: this
    });
  }
  moveTo(x, y) {
    // 自身移动
    $(this.dom).css('top', y).css('left', x);
    this.nodes.forEach((node) => {
      node.endpoints.forEach((point) => {
        point.updatePos();
      });
    });
    this.top = y;
    this.left = x;
  }
  focus() {

  }
  unFocus() {
    
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  _addEventLinster() {
    $(this.dom).on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._emit('system.group.click', {
        group: this
      });
      this._emit('events', {
        type: 'group:click',
        group: this
      });
    });
    $(this.dom).on('mousedown', (e) => {
      let LEFT_KEY = 0;
      if (!e.button === LEFT_KEY) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this._emit('InnerEvents', {
        type: 'group:dragBegin',
        data: this
      });
    });
  }
  destroy() {
    $(this.dom).off();
    $(this.dom).remove();
    this._emit('system.group.delete', {
      group: this
    });
    this._emit('events', {
      type: 'group:delete',
      group: this
    });
  }
}

module.exports = BaseGroup;
