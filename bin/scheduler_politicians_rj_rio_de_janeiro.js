#!/usr/bin/env node

var express = require('express');
var assert = require('assert');

require('dotenv').config();

console.log('Start HEROKU SCHEDULER scheduler_politicians_rj_rio_de_janeiro.js');

var app = express();

var document = [
{
    "code": 287,
    "name": "Alexandre Isquierdo",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509815232/camara_municipal_rio_de_janeiro/alexandre_isquierdo_gd847.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=287",
    "email": "alexandreisquierdo@camara.rj.gov.br",
    "acronym_political_party": "DEM",
    "profile_twitter": "Isquierdorio"
},

{
    "code": 231,
    "name": "Carlo Caiado",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509816587/camara_municipal_rio_de_janeiro/carlo_caiado_20160913993.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=231",
    "email": "caiado@carlocaiado.com.br",
    "acronym_political_party": "DEM",
    "profile_twitter": "carlocaiado"
},

{
    "code": 24,
    "name": "Carlos Bolsonaro",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509817214/camara_municipal_rio_de_janeiro/carlosbolsonaro818.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=24",
    "email": "contato@carlosbolsonaro.com.br",
    "acronym_political_party": "PSC",
    "profile_twitter": "carlosbolsonaro"
},

{
    "code": 286,
    "name": "Cesar Maia",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509817487/camara_municipal_rio_de_janeiro/cesar_maia257.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=286",
    "email": "cesar.maia@camara.rj.gov.br",
    "acronym_political_party": "DEM",
    "profile_twitter": "cesarmaia"
},

{
    "code": 103,
    "name": "Chiquinho Brazão",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509817642/camara_municipal_rio_de_janeiro/chiquinho_brazao_gde_1_841.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=103",
    "email": "chiquinho.brazao@camara.rj.gov.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": "brazaochiquinho"
},

{
    "code": 321,
    "name": "Cláudio Castro",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509817894/camara_municipal_rio_de_janeiro/claudio_castro_gd695.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=321",
    "email": "claudio.castro@camara.rj.gov.br",
    "acronym_political_party": "PSC",
    "profile_twitter": "claudiocastroRJ"
},

{
    "code": 317,
    "name": "David Miranda",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509818217/camara_municipal_rio_de_janeiro/david_miranda_GR279.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=317",
    "email": "contato@davidmirandario.com.br",
    "acronym_political_party": "PSOL",
    "profile_twitter": "davidmirandario"
},

{
    "code": 99,
    "name": "Dr. Carlos Eduardo",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509818396/camara_municipal_rio_de_janeiro/carlos_eduardo162.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=99",
    "email": "dr.carloseduardo@camara.rj.gov.br",
    "acronym_political_party": "SD",
    "profile_twitter": ""
},

{
    "code": 102,
    "name": "Dr. Jairinho",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509818591/camara_municipal_rio_de_janeiro/Jairinho.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=102",
    "email": "vereadorjairinho@terra.com.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": "jairinhoRJ"
},

{
    "code": 274,
    "name": "Dr. João Ricardo",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509818725/camara_municipal_rio_de_janeiro/drjoaoricardo.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=274",
    "email": "drjoaoricardo@camara.rj.gov.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": ""
},

{
    "code": 259,
    "name": "Dr. Jorge Manaia",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509818895/camara_municipal_rio_de_janeiro/jorge_manaia230402.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=259",
    "email": "doutor@jorgemanaia.com.br",
    "acronym_political_party": "SD",
    "profile_twitter": "drjorgemanaia"
},

{
    "code": 292,
    "name": "Eliseu Kessler",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509819072/camara_municipal_rio_de_janeiro/eliseu563101.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=292",
    "email": "eliseukessler@camara.rj.gov.br",
    "acronym_political_party": "PSD",
    "profile_twitter": "eliseukessler"
},

{
    "code": 319,
    "name": "Felipe Michel",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509819340/camara_municipal_rio_de_janeiro/FelipeMichel_Gr329.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=319",
    "email": "felipe.michel@camara.rj.gov.br",
    "acronym_political_party": "PSDB",
    "profile_twitter": ""
},

{
    "code": 87,
    "name": "Fernando William",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509819452/camara_municipal_rio_de_janeiro/fernando_william_gd751.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=87",
    "email": "drfernadowilliam@gmail.com",
    "acronym_political_party": "PDT",
    "profile_twitter": ""
},

{
    "code": 313,
    "name": "Inaldo Silva",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509819591/camara_municipal_rio_de_janeiro/inaldo_silva_gd860.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=313",
    "email": "vereadorinaldosilva@gmail.com",
    "acronym_political_party": "PRB",
    "profile_twitter": ""
},

{
    "code": 312,
    "name": "Italo Ciba",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509819782/camara_municipal_rio_de_janeiro/italo_ciba_gd63.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=312",
    "email": "vereadoritalociba@gmail.com",
    "acronym_political_party": "AVANTE",
    "profile_twitter": ""
},

{
    "code": 308,
    "name": "Jair da Mendes Gomes",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509819903/camara_municipal_rio_de_janeiro/Jair_da_Mendes_Gomes_Gr791.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=308",
    "email": "jairdamendesgomes@gmail.com",
    "acronym_political_party": "PMN",
    "profile_twitter": ""
},

{
    "code": 263,
    "name": "João Mendes de Jesus",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820019/camara_municipal_rio_de_janeiro/joao_mendes_jesus918.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=263",
    "email": "joaomendesdejesus@camara.rj.gov.br",
    "acronym_political_party": "PRB",
    "profile_twitter": ""
},

{
    "code": 322,
    "name": "Jones Moura",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820132/camara_municipal_rio_de_janeiro/jones_moura_Gr646.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=322",
    "email": "contato@jonesmoura.com.br",
    "acronym_political_party": "PSD",
    "profile_twitter": ""
},

{
    "code": 107,
    "name": "Jorge Felippe",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820251/camara_municipal_rio_de_janeiro/jorgefelippe705.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=107",
    "email": "jorge.felippe@camara.rj.gov.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": ""
},

{
    "code": 288,
    "name": "Junior da Lucinha",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820459/camara_municipal_rio_de_janeiro/Junior-da-Lucinha779.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=288",
    "email": "juniordalucinha@camara.rj.gov.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": ""
},

{
    "code": 323,
    "name": "Leandro Lyra",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820598/camara_municipal_rio_de_janeiro/Leandro_Lyra_Gr649.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=323",
    "email": "leandrolyra30@gmail.com",
    "acronym_political_party": "NOVO",
    "profile_twitter": ""
},

{
    "code": 255,
    "name": "Leonel Brizola",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820840/camara_municipal_rio_de_janeiro/leonelbneto266.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=255",
    "email": "leonelbrizola@camara.rj.gov.br",
    "acronym_political_party": "PSOL",
    "profile_twitter": ""
},

{
    "code": 318,
    "name": "Luciana Novaes",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509820969/camara_municipal_rio_de_janeiro/luciana_novaes_gd874.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=318",
    "email": "mandato@vereadoraluciananovaes.com.br",
    "acronym_political_party": "PT",
    "profile_twitter": ""
},

{
    "code": 316,
    "name": "Luiz Carlos Ramos Filho",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821077/camara_municipal_rio_de_janeiro/luiz_carlos_ramos_gd166.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=316",
    "email": "luizcarlosramosfilho@globo.com",
    "acronym_political_party": "PODE",
    "profile_twitter": ""
},

{
    "code": 46,
    "name": "Marcelino D Almeida",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821316/camara_municipal_rio_de_janeiro/Marcelino_gd375.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=46",
    "email": "marcelinodalmeida@gmail.com",
    "acronym_political_party": "PP",
    "profile_twitter": ""
},

{
    "code": 314,
    "name": "Marcello Siciliano",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821418/camara_municipal_rio_de_janeiro/marcello_siciliano_gd160.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=314",
    "email": "escritoriosiciliano@hotmail.com",
    "acronym_political_party": "PHS",
    "profile_twitter": ""
},

{
    "code": 278,
    "name": "Marcelo Arar",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821546/camara_municipal_rio_de_janeiro/marcelo_arar732.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=278",
    "email": "marceloarar@camara.rj.gov.br",
    "acronym_political_party": "PTB",
    "profile_twitter": "marceloarar"
},

{
    "code": 311,
    "name": "Marielle Franco",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821663/camara_municipal_rio_de_janeiro/Marielle_Franco_Gr141.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=311",
    "email": "contato@mariellefranco.com.br",
    "acronym_political_party": "PSOL",
    "profile_twitter": ""
},

{
    "code": 310,
    "name": "Otoni de Paula",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821782/camara_municipal_rio_de_janeiro/otoni_de_paula_gd815.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=310",
    "email": "contato@otonidepaula.com.br",
    "acronym_political_party": "PSC",
    "profile_twitter": ""
},

{
    "code": 265,
    "name": "Paulo Messina",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509821897/camara_municipal_rio_de_janeiro/paulo-final997.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=265",
    "email": "paulo@messina.com.br",
    "acronym_political_party": "PROS",
    "profile_twitter": ""
},

{
    "code": 76,
    "name": "Paulo Pinheiro",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822044/camara_municipal_rio_de_janeiro/PauloPinheiro179.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=76",
    "email": "paulopinheiro@camara.rj.gov.br",
    "acronym_political_party": "PSOL",
    "profile_twitter": "paulopinheirorj"
},

{
    "code": 250,
    "name": "Prof.Célio Lupparelli",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822269/camara_municipal_rio_de_janeiro/prf_celio_lupparelli_gd86.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=250",
    "email": "celiolupparelli@globo.com",
    "acronym_political_party": "DEM",
    "profile_twitter": "celiolupparelli"
},

{
    "code": 315,
    "name": "Professor Adalmir",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822381/camara_municipal_rio_de_janeiro/Adalmir_Gr905.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=315",
    "email": "prof.adalmir@camara.rj.gov.br",
    "acronym_political_party": "PSDB",
    "profile_twitter": ""
},

{
    "code": 303,
    "name": "Professor Rogério Rocal",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822478/camara_municipal_rio_de_janeiro/RogerioRocal.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=303",
    "email": "rogeriorocal@gmail.com",
    "acronym_political_party": "PTB",
    "profile_twitter": ""
},

{
    "code": 289,
    "name": "Rafael Aloisio Freitas",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822646/camara_municipal_rio_de_janeiro/Rafael_Aloisio_Freitas.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=289",
    "email": "rafael@rafaelaloisiofreitas.com.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": "RafaelFreitasRJ"
},

{
    "code": 266,
    "name": "Reimont",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822801/camara_municipal_rio_de_janeiro/Reimont330.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=266",
    "email": "reimont@reimont.com.br",
    "acronym_political_party": "PT",
    "profile_twitter": "Reimont"
},

{
    "code": 296,
    "name": "Renato Cinco",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509822947/camara_municipal_rio_de_janeiro/renato_cinco_gd489.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=296",
    "email": "renatocinco@renatocinco.com",
    "acronym_political_party": "PSOL",
    "profile_twitter": "RenatoCincoRJ"
},

{
    "code": 232,
    "name": "Renato Moura",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509823234/camara_municipal_rio_de_janeiro/renatomoura.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=232",
    "email": "renato.moura@camara.rj.gov.br",
    "acronym_political_party": "PDT",
    "profile_twitter": ""
},

{
    "code": 55,
    "name": "Rosa Fernandes",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509823400/camara_municipal_rio_de_janeiro/rosa_fernandes.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=55",
    "email": "rosa.fernandes@camara.rj.gov.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": ""
},

{
    "code": 267,
    "name": "Tânia Bastos",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509823501/camara_municipal_rio_de_janeiro/TANIA.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=267",
    "email": "vereadorataniabastos@camara.rj.gov.br",
    "acronym_political_party": "PRB",
    "profile_twitter": "taniabastos"
},

{
    "code": 309,
    "name": "Tarcísio Motta",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509823654/camara_municipal_rio_de_janeiro/tarcisio_motta.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=309",
    "email": "contato@tarcisiomotta.com.br",
    "acronym_political_party": "PSOL",
    "profile_twitter": "MottaTarcisio"
},

{
    "code": 112,
    "name": "Teresa Bergher",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509823787/camara_municipal_rio_de_janeiro/teresa_bergher.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=112",
    "email": "teresa.bergher@camara.rj.gov.br",
    "acronym_political_party": "PSDB",
    "profile_twitter": ""
},

{
    "code": 291,
    "name": "Thiago K. Ribeiro",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509823914/camara_municipal_rio_de_janeiro/Thiago.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=291",
    "email": "thiagokribeiro@gmail.com",
    "acronym_political_party": "PMDB",
    "profile_twitter": "ThiagoKRibeiro"
},

{
    "code": 326,
    "name": "Val Ceasa",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509824027/camara_municipal_rio_de_janeiro/ValCeasa.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=326",
    "email": "val.ceasa@camara.rj.gov.br",
    "acronym_political_party": "PEN",
    "profile_twitter": ""
},

{
    "code": 269,
    "name": "Vera Lins",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509824131/camara_municipal_rio_de_janeiro/veralins416.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=269",
    "email": "veralins@camara.rj.gov.br",
    "acronym_political_party": "PP",
    "profile_twitter": ""
},

{
    "code": 59,
    "name": "Veronica Costa",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509824278/camara_municipal_rio_de_janeiro/veronica_costa.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=59",
    "email": "falecomveronicacosta@gmail.com",
    "acronym_political_party": "PMDB",
    "profile_twitter": "veronicacosta1"
},

{
    "code": 283,
    "name": "Willian Coelho",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509824431/camara_municipal_rio_de_janeiro/williancoelho.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=283",
    "email": "williancoelho@camara.rj.gov.br",
    "acronym_political_party": "PMDB",
    "profile_twitter": "willian_coelho"
},

{
    "code": 300,
    "name": "Zico",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509824558/camara_municipal_rio_de_janeiro/zico.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=300",
    "email": "vereadorzico@camara.rj.gov.br",
    "acronym_political_party": "PTB",
    "profile_twitter": ""
},

{
    "code": 320,
    "name": "Zico Bacana",
    "picture": "https://res.cloudinary.com/hgfippcp2/image/upload/v1509824674/camara_municipal_rio_de_janeiro/zico_bacana.jpg",
    "webpage": "https://www.camara.rj.gov.br/vereador_informacoes.php?m1=inform&cvd=320",
    "email": "zicobacanaassessoria@gmail.com",
    "acronym_political_party": "PHS",
    "profile_twitter": ""
}]

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

  db.collection('politicians_rj_rio_de_janeiro').deleteMany({});

  db.collection('politicians_rj_rio_de_janeiro').insertMany(document, function(err,res) {
    assert.equal(null, err);
    db.close();
  });
});

