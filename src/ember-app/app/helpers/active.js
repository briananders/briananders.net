import Ember from 'ember';

export function active(params/*, hash*/) {
  if(params[0].toLowerCase() === params[1].toLowerCase()) {
    return "active";
  }
  return "";
}

export default Ember.Helper.helper(active);
