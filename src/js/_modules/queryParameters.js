module.exports = (varName) => {
  const paramString = window.location.search.substr(1);
  const keysAndValues = paramString.split('&');
  const parameters = {};
  keysAndValues.forEach((param) => {
    const [key, value] = param.split('=');
    parameters[key] = value || true;
  });
  return parameters;
};
