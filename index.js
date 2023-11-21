const net = require('net');
const http = require('http');
const fs = require('fs');
const qs = require('querystring');

function whois(dominio) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(43, 'whois.internic.net', () => {
      client.write(`${dominio}\r\n`);
    });

    let resultado = '';

    client.on('data', (data) => {
      resultado += data.toString();
    });

    client.on('end', () => {
      resolve(resultado);
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('index.html', 'utf8', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/whois') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();

      if (body.length > 1e6) req.connection.destroy();
    });

    req.on('end', () => {
      const body_lol = qs.parse(body);
      const dominio = body_lol?.['domain'];
      
      if (!dominio) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
	res.end('No.');
      }
	  
      whois(dominio).then((kk) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
	  <button onclick="window.history.back()">Back</button>
	  <br>
	  <br>
	  <center>
	    ${kk.replace(/\n/g, '<br>')}
	  </center>
	`);
      }).catch(() => {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Something went wrong.');
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No.');
  }
});

server.listen(80, () => {
  console.log(`Server listening on port 80.`);
});
