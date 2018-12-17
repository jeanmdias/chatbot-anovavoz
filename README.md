Chatbot A NOVA VOZ
==================

Acompanhe o que os nossos representantes estão fazendo no Congresso Nacional.

Senado Federal
--------------

**GET /senador/lista/atual**

Obtém a lista de senadores em exercício.
* Request URL: http://legis.senado.leg.br/dadosabertos/senador/lista/atual
* Collection: politicians
* Schedule: manual

```javascript
collection.insertOne({
  code: parlamentar['CodigoParlamentar'],
  type: 'senador',
  name: parlamentar['NomeParlamentar'],
  full_name: parlamentar['NomeCompletoParlamentar'],
  gender: parlamentar['SexoParlamentar'],
  picture: parlamentar['UrlFotoParlamentar'],
  webpage: parlamentar['UrlPaginaParlamentar'],
  email: parlamentar['EmailParlamentar'],
  acronym_political_party: parlamentar['SiglaPartidoParlamentar'],
  state: parlamentar['UfParlamentar'],
  treatment: parlamentar['FormaTratamento']
}
```

**GET /plenario/lista/votacao/{dataInicio}/{dataFim}**

Obtém a lista das votações da(s) sessão(ões) que ocorreram no período informado. O períodonão pode ser superior a dois meses.
* Request URL: http://legis.senado.leg.br/dadosabertos/plenario/lista/votacao/20170517/20170517
* Collection: events
* Schedule: diario

```javascript
collection.insertOne({
  politician:['CodigoParlamentar'],
  code: ['CodigoSessao'],
  type: 'votacao' ou 'votacao_secreta',
  date: ['DataSessao'],
  info: ['Voto'],
  more: ['DescricaoVotacao']
}
```

**GET /plenario/lista/discursos/{dataInicio}/{dataFim}**

Obtém a lista de discursos da(s) sessão(ões) que ocorreram dentro do período informado.
* Request URL: http://legis.senado.leg.br/dadosabertos/plenario/lista/discursos/20170517/20170517
* Collection: events
* Schedule: diario

```javascript
collection.insertOne({
  politician: ['CodigoParlamentar'],
  code: ['CodigoSessao'],
  type: 'discurso',
  date: ['DataSessao'],
  info: ['Indexacao'],
  more: ['TextoIntegral']
}
```
