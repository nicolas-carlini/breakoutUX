const app = require("./app");
require('./database');

async function init() {
  try {
    await app.set('port', (process.env.PORT || 80));
    await app.listen(app.get('port'), () => {
      console.log('server on port ', app.get('port'));
    });
  } catch (e) {
    console.log(e);
  }
}

init();