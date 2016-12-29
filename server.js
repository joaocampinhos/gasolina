'use strict';

const Hapi = require('hapi');
const Datastore = require('nedb');
const db = new Datastore({ filename: 'd.b', autoload: true });
const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: __dirname
      }
    }
  }
});

server.register(require('inert'), () => {});
server.connection({ port: 3002 });

server.route({
  method: 'GET',
  path: '/',
  handler: {
    file: 'client/pages/index.html'
  }
});

server.route({
  method: 'GET',
  path: '/stats',
  handler: {
    file: 'pages/index.html'
  }
});

server.route({
  method: 'GET',
  path: '/gas/daily',
  handler: (request, reply) => {
    db.loadDatabase(function (err) {
      if(err) console.log(err);
      db.find({}).sort({ date: -1 }).limit(2).exec( (err, docs) => {
        if (!docs) return reply({});
        //change it!
        if (docs.length === 2) {
          for (let key in docs[0].data) {
            docs[0].data[key] = [docs[0].data[key], docs[0].data[key] - docs[1].data[key]];
          }
        }
        reply(docs[0]);
      });
    });
  }
});

server.route({
  method: 'GET',
  path: '/gas/chart',
  handler: (request, reply) => {
    db.loadDatabase(function (err) {
      if(err) console.log(err);
      db.find({}).sort({ date: -1 }).exec( (err, docs) => {
        if (!docs) return reply({});
        var res = [
          { key: 'Gasolina 95', values: [] },
          { key: 'Gasolina 98', values: [] },
          { key: 'Gasóleo', values: [] },
          { key: 'GPL Auto', values: [] },
          { key: 'Gasolina aditivada', values: [] },
          { key: 'Gasóleo especial', values: [] },
          { key: 'Gasóleo colorido', values: [] },
          { key: 'Gasóleo de aquecimento', values: [] },
          { key: 'Gasolina especial 95', values: [] },
          { key: 'Gasolina especial 98', values: [] },
          { key: 'Biodiesel B10', values: [] },
          { key: 'Gasolina de mistura (motores a 2 tempos)', values: [] },
          { key: 'Gasóleo simples', values: [] },
          { key: 'Gasolina simples 95', values: [] },
          { key: 'GNC (gás natural comprimido) - €/m3', values: [] },
          { key: 'GNL (gás natural liquefeito) - €/kg', values: [] },
        ];
        docs.forEach((e) => {
          const date = new Date(e.date).getTime();
          for (var key in e.data) {
            res.find((e) => e.key === key).values.push({ 'x': date, 'y': e.data[key] })
          }
        });
        //console.log(res);
        reply(res)
      });
    });
  }
});

server.route({
  method: 'GET',
  path: '/gas/all',
  handler: (request, reply) => {
    db.loadDatabase(function (err) {
      db.find({}).sort({ date: -1 }).exec( (err, docs) => {
        if (!docs) return reply({});
        reply(docs)
      });
    });
  }
});

server.route({
  method: 'GET',
  path: '/{param}',
  handler: {
    directory: {
      path: 'public',
      redirectToSlash: true
    }
  }
});

server.start((err) => {
  if (err) throw err;
  console.log(`Server running at: ${server.info.uri}`);
});
