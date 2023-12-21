// 事件队列管理
export function createEventBus() {
  const control = Object.create(null);
  control._store = {}; // type: cb<Array>
  // 注册
  control.register = function(type, cb, _id) {
    _id && (cb._id = _id);
    if (Array.isArray(control._store[type])) {
      control._store[type].push(cb);
    } else {
      control._store[type] = [cb];
    }
  };
  // 注销
  control.unregister = function(type, _id) {
    if (!_id) {
      delete control._store[type];
      return true;
    }
    const idx = control._store[type].findIndex(item => item._id === _id);
    let success = false;
    if (idx !== -1) {
      control._store[type].splice(idx, 1);
      success = true;
    }
    return success;
  };
  // 派发
  control.emit = function(type, data) {
    if (control._store[type]) {
      control._store[type].forEach(cb => cb(data));
    }
  };
  return control;
}
