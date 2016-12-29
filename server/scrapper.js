#!/usr/bin/env node

const path = require('path').normalize(__dirname+'/../d.b');
const request = require('request');
const cheerio = require('cheerio');
const Datastore = require('nedb')
const db = new Datastore({ filename: path, autoload: true });

console.log('Using database from',path);

const options = {
  url: 'http://www.precoscombustiveis.dgeg.pt/pagina.aspx?mnredir=1&codigono=6298AAAAAAAAAAAAAAAAAAAA&lnc=6176AAAAAAAAAAAAAAAAAAAA&g7765n0nrec=7',
  headers: {
    'Cookie': 'ASP.NET_SessionId=2btggojplm4czye1jthelcfs; ASPSESSIONIDSQABQBTS=LOJBCEJDJAGJILPHJKKPDOHK; Origem=MQ2; StartTime=NjY5NjUsNjk4OTAwNw2; mlkid=2btggojplm4czye1jthelcfs; Saida=RXN0YXTDrXN0aWNhcw2'
  }
};

console.log('Getting new info');
request(options, function(error, response, html) {
  if(!error) all(html);
})

function all(html) {
  console.log('Parsing...');
  var url = {
    url : 'http://www.precoscombustiveis.dgeg.pt/wwwbase/raiz/mlkListagemCallback_v11.aspx',
    form: { }
  };

  var $ = cheerio.load(html);
  var x = $('.TabelaGeral > tr:nth-child(2) > td')
  var date = $(x, '.dvCWOW').text().trim();
  db.findOne({date: new Date(date)}, function (err, docs) {
    if (docs) {
      console.log('Nothing to update');
      return process.exit();
    }

    let [l, f, g, n] = $(x)['0'].children[0].children[0].attribs['onclick'].replace('listagemAF(this, ','').replace(');','').replace(/\'/g, '').split(', ').map((e) => parseInt(e));

    url.form = {linha: l, fi: f, geradorid: g, nivel: n}

    request.post(url, function(error, response, html){
      let tmp = [];
      if(!error) {
        cheerio.load(html)('td.Celula div[style*=left]').each((i, e) => {
          tmp[i] = [e.children[0].data.trim()]
      });
        cheerio.load(html)('td.Celula div[style*=center]').each((i, e) => tmp[i].push(parseFloat(e.children[0].data.replace('€','').replace(',','.'))));
        let res = tmp.reduce((p, v, i, a) => {
          p[v[0]] = v[1];
          return p;
        },{});

        let doc = {date: new Date(date), data: res}
        console.log(`Database updated with info from ${date}`);
        db.insert(doc);

      }
    });
  });
}
